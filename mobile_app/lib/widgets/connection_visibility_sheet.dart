import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/profile.dart';
import '../services/api_service.dart';

class ConnectionVisibilitySheet extends StatefulWidget {
  final Connection connection;
  final VoidCallback onSaved;

  const ConnectionVisibilitySheet({
    Key? key,
    required this.connection,
    required this.onSaved,
  }) : super(key: key);

  @override
  State<ConnectionVisibilitySheet> createState() => _ConnectionVisibilitySheetState();
}

class _ConnectionVisibilitySheetState extends State<ConnectionVisibilitySheet> {
  final ApiService _api = ApiService();

  late bool _shareName;
  late bool _shareEmail;
  late bool _sharePhone;
  late bool _shareWhatsapp;
  late bool _shareLocation;
  late List<int> _sharedSocialIds;

  List<SocialLink> _mySocials = [];
  bool _loadingProfile = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.connection.myPermissions;
    _shareName = p?.shareName ?? true;
    _shareEmail = p?.shareEmail ?? true;
    _sharePhone = p?.sharePhone ?? false;
    _shareWhatsapp = p?.shareWhatsapp ?? true;
    _shareLocation = p?.shareLocation ?? false;
    _sharedSocialIds = List<int>.from(p?.sharedSocialIds ?? []);

    _loadMyProfile();
  }

  Future<void> _loadMyProfile() async {
    try {
      final res = await _api.getProfile();
      if (res != null && res['profile'] != null && mounted) {
        final profile = res['profile'] as Profile;
        setState(() {
          _mySocials = profile.socials;
          // If this is a legacy connection and we have no myPermissions, default to sharing all socials
          if (widget.connection.myPermissions == null) {
            _sharedSocialIds = profile.socials.map((s) => s.id).whereType<int>().toList();
          }
          _loadingProfile = false;
        });
      } else if (mounted) {
        setState(() => _loadingProfile = false);
      }
    } catch (e) {
      debugPrint('Error loading own profile: $e');
      if (mounted) setState(() => _loadingProfile = false);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final settings = ConnectionPermissionData(
      shareName: _shareName,
      shareEmail: _shareEmail,
      sharePhone: _sharePhone,
      shareWhatsapp: _shareWhatsapp,
      shareLocation: _shareLocation,
      sharedSocialIds: _sharedSocialIds,
    );

    final res = await _api.updateConnectionVisibility(widget.connection.id, settings);
    if (mounted) {
      setState(() => _saving = false);
      if (res['success'] == true) {
        Navigator.pop(context);
        widget.onSaved();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Visibility settings updated!'),
            backgroundColor: Color(0xFF10b981),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['error'] ?? 'Failed to update visibility settings.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final otherName = widget.connection.other.name ?? 'this connection';

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF1a1a2e),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: _loadingProfile
          ? const SizedBox(
              height: 250,
              child: Center(child: CircularProgressIndicator(color: Colors.indigoAccent)),
            )
          : SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Sharing Settings',
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Choose what details are visible to $otherName.',
                    style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white12),
                  const SizedBox(height: 8),

                  Text(
                    'CONTACT DETAILS',
                    style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigoAccent, letterSpacing: 1.2),
                  ),
                  const SizedBox(height: 8),

                  _buildToggle('Name', 'Your display name', Icons.person_outline, _shareName,
                      (v) => setState(() => _shareName = v)),
                  _buildToggle('Email', 'Your email address', Icons.email_outlined, _shareEmail,
                      (v) => setState(() => _shareEmail = v)),
                  _buildToggle('Phone', 'Your phone number', Icons.phone_outlined, _sharePhone,
                      (v) => setState(() => _sharePhone = v)),
                  _buildToggle('WhatsApp', 'Your WhatsApp contact', Icons.chat_outlined, _shareWhatsapp,
                      (v) => setState(() => _shareWhatsapp = v)),
                  _buildToggle('Location', 'Your location details', Icons.location_on_outlined, _shareLocation,
                      (v) => setState(() => _shareLocation = v)),

                  if (_mySocials.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Divider(color: Colors.white12),
                    const SizedBox(height: 8),
                    Text(
                      'SOCIAL LINKS',
                      style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigoAccent, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    ..._mySocials.map((link) {
                      if (link.id == null) return const SizedBox.shrink();
                      final isShared = _sharedSocialIds.contains(link.id);
                      final cardColor = Color(int.parse(link.color.replaceFirst('#', '0xFF')));

                      return _buildToggle(
                        link.platform,
                        link.handle,
                        Icons.link,
                        isShared,
                        (v) {
                          setState(() {
                            if (v) {
                              _sharedSocialIds.add(link.id!);
                            } else {
                              _sharedSocialIds.remove(link.id!);
                            }
                          });
                        },
                        iconColor: cardColor,
                      );
                    }),
                  ],

                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366f1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      child: _saving
                          ? const SizedBox(
                              width: 20, height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              'Save Settings',
                              style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildToggle(
    String label,
    String description,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged, {
    Color? iconColor,
  }) {
    final effectiveIconColor = iconColor ?? Colors.indigoAccent;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: effectiveIconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: effectiveIconColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                Text(description, style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF6366f1),
          ),
        ],
      ),
    );
  }
}
