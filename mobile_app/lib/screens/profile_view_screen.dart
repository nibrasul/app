import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/profile.dart';
import '../services/api_service.dart';

class ProfileViewScreen extends StatefulWidget {
  final int? userId;

  const ProfileViewScreen({Key? key, this.userId}) : super(key: key);

  @override
  _ProfileViewScreenState createState() => _ProfileViewScreenState();
}

class _ProfileViewScreenState extends State<ProfileViewScreen> {
  final ApiService _apiService = ApiService();
  final _searchController = TextEditingController();

  Profile? _profile;
  int? _userId;
  bool _loading = false;
  String? _error;
  bool _connecting = false;
  bool _connected = false;

  @override
  void initState() {
    super.initState();
    _userId = widget.userId;
    if (_userId != null) {
      _loadProfile(_userId!);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile(int userId) async {
    setState(() {
      _loading = true;
      _error = null;
      _profile = null;
      _connected = false;
    });

    final res = await _apiService.getProfile(userId: userId);

    if (res != null) {
      setState(() {
        _profile = res['profile'];
      });
    } else {
      setState(() {
        _error = 'Profile not found. Make sure user ID is correct.';
      });
    }

    setState(() {
      _loading = false;
    });
  }

  Future<void> _handleConnect() async {
    if (_profile == null || _connected || _connecting) return;

    setState(() {
      _connecting = true;
    });

    final res = await _apiService.tapProfile(_profile!.id);

    setState(() {
      _connecting = false;
    });

    if (res['success'] == true) {
      setState(() {
        _connected = true;
        _profile = res['profile'];
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res['error'] ?? 'Failed to connect'), backgroundColor: Colors.redAccent),
      );
    }
  }

  Widget _buildGlassCard({required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Search UI (only if not loaded directly)
          if (widget.userId == null) ...[
            Container(
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.04),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      keyboardType: TextInputType.number,
                      style: GoogleFonts.outfit(color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Enter User ID to view profile',
                        hintStyle: TextStyle(color: Colors.white30),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.search, color: Colors.indigoAccent),
                    onPressed: () {
                      final val = int.tryParse(_searchController.text.trim());
                      if (val != null) {
                        _loadProfile(val);
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please enter a valid numeric ID')),
                        );
                      }
                    },
                  ),
                ],
              ),
            ),
          ],

          if (_loading)
            const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
          else if (_error != null)
            Center(child: Text(_error!, style: const TextStyle(color: Colors.redAccent)))
          else if (_profile == null && widget.userId == null)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 40.0),
                child: Column(
                  children: [
                    const Icon(Icons.nfc_outlined, size: 80, color: Colors.white24),
                    const SizedBox(height: 16),
                    Text(
                      'Search a user above, or tap a user in the Leaderboard to view their card.',
                      style: GoogleFonts.outfit(color: Colors.white38, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else if (_profile != null) ...[
            _buildGlassCard(
              children: [
                // Header (Avatar, name, tagline)
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.white10,
                  backgroundImage: _profile!.avatar.startsWith('data:')
                      ? MemoryImage(base64Decode(_profile!.avatar.split(',')[1]))
                      : NetworkImage('${_apiService.baseUrl}${_profile!.avatar}') as ImageProvider,
                ),
                const SizedBox(height: 16),
                Text(
                  _profile!.name,
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                ),
                if (_profile!.tagline.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    _profile!.tagline,
                    style: GoogleFonts.outfit(color: Colors.white70, fontSize: 15),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 24),

                // Connect button & Tap stats
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _connected ? const Color(0xFF10B981) : Colors.indigoAccent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _connecting || _connected ? null : _handleConnect,
                    child: _connecting
                        ? const CircularProgressIndicator(color: Colors.white)
                        : Text(
                            _connected ? '✓ Connected!' : 'Connect with me',
                            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.bolt, color: Colors.tealAccent, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${_profile!.tapCount} total connections',
                      style: GoogleFonts.outfit(color: Colors.white54, fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Quote
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.02),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '“Design is not just what it looks like, it’s how it connects.”',
                    style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12, fontStyle: FontStyle.italic),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 24),

                // About section
                if (_profile!.bio.isNotEmpty) ...[
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'About',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      _profile!.bio,
                      style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14, height: 1.4),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Tags section
                if (_profile!.tags.isNotEmpty) ...[
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    alignment: WrapAlignment.center,
                    children: _profile!.tags.map((t) {
                      final isLoc = t.type == 'location';
                      return Chip(
                        backgroundColor: Colors.white.withOpacity(0.05),
                        side: BorderSide(color: Colors.white.withOpacity(0.1)),
                        avatar: Text(isLoc ? '📍' : '⚙️'),
                        label: Text(
                          t.text,
                          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                ],

                // Social Links section
                if (_profile!.socials.isNotEmpty) ...[
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Links',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._profile!.socials.map((link) {
                    final cardColor = Color(int.parse(link.color.replaceFirst('#', '0xFF')));
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.02),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cardColor.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                link.platform,
                                style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                link.handle,
                                style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12),
                              ),
                            ],
                          ),
                          Icon(Icons.open_in_new, color: cardColor, size: 20),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}
