import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/profile.dart';
import '../services/api_service.dart';
import '../widgets/connection_permission_sheet.dart';
import '../widgets/connection_visibility_sheet.dart';

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

  Future<void> _accept(PendingRequest req) async {
    final result = await _api.acceptRequest(req.id);
    if (!mounted) return;
    if (result['success'] == true) {
      _refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connection accepted!'), backgroundColor: Color(0xFF10b981)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'] ?? 'Failed to accept request.'), backgroundColor: Colors.redAccent),
      );
    }
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

  void _showGlobalSharingSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ConnectionPermissionSheet(),
    );
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
            icon: const Icon(Icons.settings, color: Colors.white70),
            onPressed: _showGlobalSharingSettings,
          ),
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
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 26,
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
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              '💎 ${req.requesterDiamonds}',
                              style: GoogleFonts.outfit(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              '👥 ${req.requesterConnectionCount} connections',
                              style: GoogleFonts.outfit(color: Colors.tealAccent, fontSize: 11),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              '⚡ ${req.requesterTapCount} taps',
                              style: GoogleFonts.outfit(color: Colors.purpleAccent, fontSize: 11),
                            ),
                            if (req.via == 'nfc') ...[
                              const SizedBox(width: 10),
                              Text(
                                'via NFC',
                                style: GoogleFonts.outfit(color: Colors.indigoAccent, fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ]
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    children: [
                      SizedBox(
                        width: 80,
                        child: ElevatedButton(
                          onPressed: () => _accept(req),
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
              if (req.requesterTags.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(color: Colors.white12, height: 1),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: req.requesterTags.map((t) {
                    final isLoc = t.type == 'location';
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isLoc
                            ? const Color(0xFF10b981).withOpacity(0.08)
                            : const Color(0xFF6366f1).withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isLoc
                              ? const Color(0xFF10b981).withOpacity(0.2)
                              : const Color(0xFF6366f1).withOpacity(0.2),
                        ),
                      ),
                      child: Text(
                        '${isLoc ? '📍' : '⚙️'} ${t.text}',
                        style: GoogleFonts.outfit(fontSize: 11, color: Colors.white70),
                      ),
                    );
                  }).toList(),
                ),
              ],
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
            if (other.email != null && other.email!.isNotEmpty) _detailRow(Icons.email_outlined, other.email!),
            if (other.phone != null && other.phone!.isNotEmpty) _detailRow(Icons.phone_outlined, other.phone!),
            if (other.whatsapp != null && other.whatsapp!.isNotEmpty)
              _detailRow(Icons.chat_outlined, other.whatsapp!, isLink: true),
            if (other.location != null && other.location!.isNotEmpty)
              _detailRow(Icons.location_on_outlined, other.location!),
            if (other.socials.isNotEmpty) ...[
              const Divider(color: Colors.white12),
              const SizedBox(height: 10),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Shared Links', style: GoogleFonts.outfit(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.start,
                children: other.socials.map((link) {
                  final cardColor = Color(int.parse(link.color.replaceFirst('#', '0xFF')));
                  return InkWell(
                    onTap: () => launchUrl(Uri.parse(link.url), mode: LaunchMode.externalApplication),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.02),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cardColor.withOpacity(0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.link, color: cardColor, size: 16),
                          const SizedBox(width: 6),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(link.platform, style: GoogleFonts.outfit(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              Text(link.handle, style: GoogleFonts.outfit(color: Colors.white38, fontSize: 10)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 16),
            const Divider(color: Colors.white12),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.share, size: 16),
                label: const Text('Manage Sharing with User'),
                onPressed: () {
                  Navigator.pop(context);
                  _showVisibilitySettings(conn);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.05),
                  foregroundColor: Colors.white70,
                  side: BorderSide(color: Colors.white.withOpacity(0.1)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showVisibilitySettings(Connection conn) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ConnectionVisibilitySheet(
        connection: conn,
        onSaved: () {
          _refresh();
        },
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
