import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart';
import 'leaderboard_screen.dart';
import 'history_screen.dart';
import 'profile_view_screen.dart';
import 'connections_screen.dart';
import '../services/api_service.dart';

class MainNavigationShell extends StatefulWidget {
  final VoidCallback onLogout;

  const MainNavigationShell({Key? key, required this.onLogout}) : super(key: key);

  @override
  _MainNavigationShellState createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  final ApiService _apiService = ApiService();
  int _pendingCount = 0;

  late List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const DashboardScreen(),
      const LeaderboardScreen(),
      const HistoryScreen(),
      const ConnectionsScreen(),
      const ProfileViewScreen(),
    ];
    _fetchPendingCount();
  }

  Future<void> _fetchPendingCount() async {
    final pending = await _apiService.getPendingRequests();
    if (mounted) {
      setState(() => _pendingCount = pending.length);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141420),
        elevation: 0,
        title: Row(
          children: [
            Text(
              'Tap',
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.bold,
                fontSize: 22,
                color: Colors.white,
              ),
            ),
            Text(
              'folio',
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w400,
                fontSize: 22,
                color: Colors.indigoAccent,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: () async {
              await _apiService.logout();
              widget.onLogout();
            },
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
          // Refresh pending count when switching to connections tab
          if (index == 3) _fetchPendingCount();
        },
        backgroundColor: const Color(0xFF141420),
        selectedItemColor: Colors.indigoAccent,
        unselectedItemColor: Colors.white38,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w500),
        unselectedLabelStyle: GoogleFonts.outfit(fontSize: 12),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events_outlined),
            activeIcon: Icon(Icons.emoji_events),
            label: 'Leaderboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.history_outlined),
            activeIcon: Icon(Icons.history),
            label: 'Logs',
          ),
          BottomNavigationBarItem(
            icon: _pendingCount > 0
                ? Badge.count(
                    count: _pendingCount,
                    child: const Icon(Icons.people_outline),
                  )
                : const Icon(Icons.people_outline),
            activeIcon: _pendingCount > 0
                ? Badge.count(
                    count: _pendingCount,
                    child: const Icon(Icons.people),
                  )
                : const Icon(Icons.people),
            label: 'Connections',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.nfc_outlined),
            activeIcon: Icon(Icons.nfc),
            label: 'Tap Profile',
          ),
        ],
      ),
    );
  }
}
