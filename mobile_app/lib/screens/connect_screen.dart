import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';
import '../models/profile.dart';

class ConnectScreen extends StatefulWidget {
  final String username;

  const ConnectScreen({Key? key, required this.username}) : super(key: key);

  @override
  State<ConnectScreen> createState() => _ConnectScreenState();
}

class _ConnectScreenState extends State<ConnectScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();

  bool _loading = true;
  bool _sending = false;
  bool _success = false;

  Map<String, dynamic>? _profileData;
  String? _connectionStatus;
  String? _error;

  late AnimationController _avatarController;
  late Animation<double> _avatarAnim;

  @override
  void initState() {
    super.initState();
    _avatarController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _avatarAnim = CurvedAnimation(parent: _avatarController, curve: Curves.elasticOut);
    _loadProfile();
  }

  @override
  void dispose() {
    _avatarController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() { _loading = true; _error = null; });
    final result = await _api.lookupUser(widget.username);
    if (!mounted) return;
    if (result == null) {
      setState(() { _loading = false; _error = 'User not found.'; });
      return;
    }
    setState(() {
      _profileData = result['profile'];
      _connectionStatus = result['connectionStatus'];
      _loading = false;
    });
    _avatarController.forward();
  }

  Future<void> _sendRequest() async {
    setState(() { _sending = true; _error = null; });
    final result = await _api.sendConnectionRequest(widget.username, via: 'link');
    if (!mounted) return;
    if (result['success'] == true) {
      setState(() { _sending = false; _success = true; _connectionStatus = 'pending'; });
    } else {
      final status = result['status'] as String?;
      if (status != null) {
        setState(() { _sending = false; _connectionStatus = status; });
      } else {
        setState(() { _sending = false; _error = result['error'] ?? 'Failed to send request.'; });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141420),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Connect',
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
          : _error != null && _profileData == null
              ? _buildError()
              : _buildContent(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.person_off_outlined, size: 64, color: Colors.white30),
          const SizedBox(height: 16),
          Text(_error!, style: GoogleFonts.outfit(color: Colors.white54, fontSize: 16)),
          const SizedBox(height: 24),
          TextButton(
            onPressed: _loadProfile,
            child: Text('Retry', style: GoogleFonts.outfit(color: Colors.indigoAccent)),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final profile = _profileData!;
    final name = profile['name'] as String? ?? '';
    final tagline = profile['tagline'] as String? ?? '';
    final avatar = profile['avatar'] as String? ?? '';
    final bio = profile['bio'] as String? ?? '';
    final tags = (profile['tags'] as List? ?? []).map((t) => Tag.fromJson(t)).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 16),

          // Avatar
          ScaleTransition(
            scale: _avatarAnim,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366f1), Color(0xFF818cf8)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366f1).withValues(alpha: 0.35),
                    blurRadius: 30,
                    spreadRadius: 4,
                  ),
                ],
              ),
              padding: const EdgeInsets.all(3),
              child: CircleAvatar(
                radius: 56,
                backgroundImage: NetworkImage(
                  avatar.startsWith('http') ? avatar : 'https://www.tapfolio.me$avatar',
                ),
                backgroundColor: const Color(0xFF1a1a2e),
              ),
            ),
          ),

          const SizedBox(height: 20),

          Text(
            name,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),

          if (tagline.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              tagline,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 14, color: Colors.white54, fontStyle: FontStyle.italic),
            ),
          ],

          if (tags.isNotEmpty) ...[
            const SizedBox(height: 16),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              runSpacing: 6,
              children: tags.map((t) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: t.type == 'location'
                      ? const Color(0xFF10b981).withValues(alpha: 0.12)
                      : const Color(0xFF6366f1).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: t.type == 'location'
                        ? const Color(0xFF10b981).withValues(alpha: 0.3)
                        : const Color(0xFF6366f1).withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  '${t.type == 'location' ? '📍 ' : '⚙️ '}${t.text}',
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.white70),
                ),
              )).toList(),
            ),
          ],

          if (bio.isNotEmpty) ...[
            const SizedBox(height: 24),
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                  ),
                  child: Text(
                    bio,
                    textAlign: TextAlign.center,
                    style: GoogleFonts.outfit(fontSize: 14, color: Colors.white60, height: 1.6),
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 40),

          // Action button / status
          _buildActionButton(),

          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: GoogleFonts.outfit(color: Colors.redAccent, fontSize: 13)),
          ],

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    if (_success || _connectionStatus == 'pending') {
      return _statusChip(
        Icons.hourglass_top_rounded,
        'Request Pending',
        const Color(0xFFf59e0b),
      );
    }
    if (_connectionStatus == 'accepted') {
      return _statusChip(
        Icons.check_circle_outline,
        'Already Connected',
        const Color(0xFF10b981),
      );
    }
    if (_connectionStatus == 'blocked') {
      return _statusChip(Icons.block, 'Blocked', Colors.red);
    }

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _sending ? null : _sendRequest,
        icon: _sending
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : const Icon(Icons.person_add_alt_1, size: 20),
        label: Text(
          _sending ? 'Sending...' : 'Send Connection Request',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6366f1),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _statusChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Text(label, style: GoogleFonts.outfit(color: color, fontWeight: FontWeight.w600, fontSize: 15)),
        ],
      ),
    );
  }
}
