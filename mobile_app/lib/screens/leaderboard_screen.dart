import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/profile.dart';
import '../services/api_service.dart';
import 'profile_view_screen.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  _LeaderboardScreenState createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final ApiService _apiService = ApiService();
  List<Profile> _leaderboard = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final res = await _apiService.getLeaderboard();
      setState(() {
        _leaderboard = res;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load leaderboard';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Widget _getRankBadge(int rank) {
    Color badgeColor;
    String badgeText = rank.toString();

    if (rank == 1) {
      badgeColor = const Color(0xFFF59E0B); // Gold
    } else if (rank == 2) {
      badgeColor = const Color(0xFF94A3B8); // Silver
    } else if (rank == 3) {
      badgeColor = const Color(0xFFB45309); // Bronze
    } else {
      badgeColor = Colors.white24;
    }

    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: badgeColor,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Text(
        badgeText,
        style: GoogleFonts.outfit(
          color: rank <= 3 ? Colors.black : Colors.white70,
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F16),
      body: RefreshIndicator(
        onRefresh: _fetchLeaderboard,
        color: Colors.indigoAccent,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tapfolio Leaderboard',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Discover elite creators and professionals. Premium accounts with a profile score >= 60 qualify.',
                style: GoogleFonts.outfit(
                  color: Colors.white60,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 24),
              if (_loading)
                const Center(child: Padding(
                  padding: EdgeInsets.only(top: 40.0),
                  child: CircularProgressIndicator(color: Colors.indigoAccent),
                ))
              else if (_error != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 40.0),
                    child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
                  ),
                )
              else if (_leaderboard.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.emoji_events_outlined, size: 60, color: Colors.indigoAccent),
                      const SizedBox(height: 16),
                      Text(
                        'No Qualified Profiles Yet',
                        style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Be the first to upgrade your profile and meet all checklist criteria to rank number one!',
                        style: GoogleFonts.outfit(color: Colors.white54, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              else
                ...List.generate(_leaderboard.length, (index) {
                  final profile = _leaderboard[index];
                  final rank = index + 1;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.03),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: rank == 1
                            ? const Color(0xFFF59E0B).withOpacity(0.4)
                            : rank == 2
                                ? const Color(0xFF94A3B8).withOpacity(0.4)
                                : rank == 3
                                    ? const Color(0xFFB45309).withOpacity(0.4)
                                    : Colors.white.withOpacity(0.06),
                      ),
                    ),
                    child: Row(
                      children: [
                        // Rank Number
                        _getRankBadge(rank),
                        const SizedBox(width: 12),

                        // Avatar
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.white10,
                          backgroundImage: profile.avatar.startsWith('data:')
                              ? MemoryImage(base64Decode(profile.avatar.split(',')[1]))
                              : NetworkImage('${_apiService.baseUrl}${profile.avatar}') as ImageProvider,
                        ),
                        const SizedBox(width: 12),

                        // Details
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      profile.name,
                                      style: GoogleFonts.outfit(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '💎 Premium',
                                      style: GoogleFonts.outfit(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                profile.tagline,
                                style: GoogleFonts.outfit(color: Colors.white60, fontSize: 12),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),
                              // Score stats
                              Row(
                                children: [
                                  Icon(Icons.check_circle_outline, size: 14, color: Colors.indigoAccent),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${profile.diamonds} Pts',
                                    style: GoogleFonts.outfit(color: Colors.indigoAccent, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 12),
                                  Icon(Icons.bolt, size: 14, color: Colors.tealAccent),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${profile.tapCount} Taps',
                                    style: GoogleFonts.outfit(color: Colors.tealAccent, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Action button
                        IconButton(
                          icon: const Icon(Icons.arrow_forward_ios, color: Colors.white38, size: 18),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => Scaffold(
                                  backgroundColor: const Color(0xFF0F0F16),
                                  appBar: AppBar(
                                    backgroundColor: const Color(0xFF141420),
                                    title: Text('Profile View', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                                  ),
                                  body: ProfileViewScreen(userId: profile.userId),
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}
