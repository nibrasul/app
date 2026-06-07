import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/profile.dart';
import '../services/api_service.dart';
import '../widgets/connection_permission_sheet.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({Key? key}) : super(key: key);

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  late TabController _tabController;

  List<PendingRequest> _pending = [];
  List<Connection> _connections = [];
  bool _loadingPending = true;
  bool _loadingConnections = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _refresh();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() { _loadingPending = true; _loadingConnections = true; });
    final results = await Future.wait([
      _api.getPendingRequests(),
      _api.getConnections(),
    ]);
    if (!mounted) return;
    setState(() {
      _pending = results[0] as List<PendingRequest>;
      _connections = results[1] as List<Connection>;
      _loadingPending = false;
      _loadingConnections = false;
    });
  }

  void _showPermissionSheet(PendingRequest req) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ConnectionPermissionSheet(
        connectionId: req.id,
        requesterName: req.requesterName,
        onDone: _refresh,
      ),
    );
  }

  Future<void> _reject(PendingRequest req) async {
    final result = await _api.rejectRequest(req.id);
    if (!mounted) return;
    if (result['success'] == true) {
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Request rejected.'), backgroundColor: Color(0xFF374151)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF141420),
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Text('Connections', style: GoogleFonts.outfit(
              fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white,
            )),
            if (_pending.isNotEmpty) ...[
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.redAccent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_pending.length}',
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: _refresh,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.indigoAccent,
          labelColor: Colors.indigoAccent,
          unselectedLabelColor: Colors.white38,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
          tabs: [
            Tab(text: 'Requests${_pending.isNotEmpty ? ' (${_pending.length})' : ''}'),
            const Tab(text: 'My Connections'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPendingTab(),
          _buildConnectionsTab(),
        ],
      ),
    );
  }

  // ─── Pending Requests Tab ─────────────────────────────────────────────────

  Widget _buildPendingTab() {
    if (_loadingPending) {
      return const Center(child: CircularProgressIndicator(color: Colors.indigoAccent));
    }
    if (_pending.isEmpty) {
      return _emptyState(Icons.inbox_outlined, 'No pending requests', 'When someone wants to connect, it\'ll show up here.');
    }
    return RefreshIndicator(
      color: Colors.indigoAccent,
      onRefresh: _refresh,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _pending.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _buildRequestCard(_pending[i]),
      ),
    );
  }

  Widget _buildRequestCard(PendingRequest req) {
    final avatarUrl = req.requesterAvatar.startsWith('http')
        ? req.requesterAvatar
        : 'https://www.tapfolio.me${req.requesterAvatar}';

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundImage: NetworkImage(avatarUrl),
                backgroundColor: const Color(0xFF1a1a2e),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      req.requesterName,
                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    if (req.requesterTagline.isNotEmpty)
                      Text(
                        req.requesterTagline,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12),
                      ),
                    if (req.via == 'nfc')
                      Text('via NFC tap', style: GoogleFonts.outfit(color: Colors.indigoAccent, fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                children: [
                  SizedBox(
                    width: 80,
                    child: ElevatedButton(
                      onPressed: () => _showPermissionSheet(req),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366f1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                      child: const Text('Accept'),
                    ),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 80,
                    child: OutlinedButton(
                      onPressed: () => _reject(req),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white54,
                        side: const BorderSide(color: Colors.white12),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: GoogleFonts.outfit(fontSize: 13),
                      ),
                      child: const Text('Reject'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── My Connections Tab ───────────────────────────────────────────────────

  Widget _buildConnectionsTab() {
    if (_loadingConnections) {
      return const Center(child: CircularProgressIndicator(color: Colors.indigoAccent));
    }
    if (_connections.isEmpty) {
      return _emptyState(Icons.people_outline, 'No connections yet', 'Start connecting by sharing your Tapfolio link or NFC card.');
    }
    return RefreshIndicator(
      color: Colors.indigoAccent,
      onRefresh: _refresh,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _connections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _buildConnectionCard(_connections[i]),
      ),
    );
  }

  Widget _buildConnectionCard(Connection conn) {
    final other = conn.other;
    final avatarUrl = other.avatar.startsWith('http')
        ? other.avatar
        : 'https://www.tapfolio.me${other.avatar}';

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: ListTile(
            onTap: () => _showConnectionDetail(conn),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              radius: 26,
              backgroundImage: NetworkImage(avatarUrl),
              backgroundColor: const Color(0xFF1a1a2e),
            ),
            title: Text(
              other.name ?? 'Anonymous',
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600),
            ),
            subtitle: Text(
              other.tagline,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (conn.via == 'nfc')
                  const Icon(Icons.nfc, size: 16, color: Colors.indigoAccent),
                const SizedBox(width: 4),
                const Icon(Icons.chevron_right, color: Colors.white24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showConnectionDetail(Connection conn) {
    final other = conn.other;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1a1a2e),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage(other.avatar.startsWith('http')
                  ? other.avatar : 'https://www.tapfolio.me${other.avatar}'),
              backgroundColor: const Color(0xFF1a1a2e),
            ),
            const SizedBox(height: 14),
            Text(other.name ?? 'Anonymous',
              style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
            if (other.tagline.isNotEmpty)
              Text(other.tagline,
                style: GoogleFonts.outfit(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 20),
            const Divider(color: Colors.white12),
            if (other.email != null) _detailRow(Icons.email_outlined, other.email!),
            if (other.phone != null) _detailRow(Icons.phone_outlined, other.phone!),
            if (other.whatsapp != null)
              _detailRow(Icons.chat_outlined, other.whatsapp!, isLink: true),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String value, {bool isLink = false}) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: Colors.indigoAccent, size: 20),
      title: Text(value, style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14)),
      onTap: isLink
          ? () => launchUrl(Uri.parse(value), mode: LaunchMode.externalApplication)
          : null,
    );
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  Widget _emptyState(IconData icon, String title, String subtitle) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Colors.white12),
            const SizedBox(height: 16),
            Text(title, style: GoogleFonts.outfit(color: Colors.white54, fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(subtitle, textAlign: TextAlign.center,
              style: GoogleFonts.outfit(color: Colors.white30, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
