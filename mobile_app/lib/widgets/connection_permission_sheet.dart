import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/profile.dart';
import '../services/api_service.dart';

class ConnectionPermissionSheet extends StatefulWidget {
  final int connectionId;
  final String requesterName;
  final VoidCallback onDone;

  const ConnectionPermissionSheet({
    Key? key,
    required this.connectionId,
    required this.requesterName,
    required this.onDone,
  }) : super(key: key);

  @override
  State<ConnectionPermissionSheet> createState() => _ConnectionPermissionSheetState();
}

class _ConnectionPermissionSheetState extends State<ConnectionPermissionSheet> {
  final ApiService _api = ApiService();

  bool _shareName = true;
  bool _shareEmail = true;
  bool _sharePhone = false;
  bool _shareWhatsapp = true;
  bool _shareLocation = false;
  bool _saving = false;

  Future<void> _confirm() async {
    setState(() => _saving = true);
    final perms = ConnectionPermissionData(
      shareName: _shareName,
      shareEmail: _shareEmail,
      sharePhone: _sharePhone,
      shareWhatsapp: _shareWhatsapp,
      shareLocation: _shareLocation,
    );
    await _api.acceptRequest(widget.connectionId, perms);
    if (mounted) {
      Navigator.pop(context);
      widget.onDone();
    }
  }

  @override
  Widget build(BuildContext context) {
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
            'Share with ${widget.requesterName}',
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Choose what contact info to share when you connect.',
            style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
          ),

          const SizedBox(height: 24),
          const Divider(color: Colors.white12),

          _buildToggle('Name', 'Your display name', Icons.person_outline, _shareName,
              (v) => setState(() => _shareName = v)),
          _buildToggle('Email', 'Your account email address', Icons.email_outlined, _shareEmail,
              (v) => setState(() => _shareEmail = v)),
          _buildToggle('Phone', 'Your phone number', Icons.phone_outlined, _sharePhone,
              (v) => setState(() => _sharePhone = v)),
          _buildToggle('WhatsApp', 'Your WhatsApp link', Icons.chat_outlined, _shareWhatsapp,
              (v) => setState(() => _shareWhatsapp = v)),
          _buildToggle('Location', 'Your location tag', Icons.location_on_outlined, _shareLocation,
              (v) => setState(() => _shareLocation = v)),

          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _confirm,
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
                      'Confirm & Connect',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggle(
    String label,
    String description,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF6366f1).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: Colors.indigoAccent, size: 20),
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
