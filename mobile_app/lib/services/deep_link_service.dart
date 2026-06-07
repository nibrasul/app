import 'dart:async';
import 'package:flutter/material.dart';
import 'package:app_links/app_links.dart';

/// Singleton service that listens for incoming deep links and routes them.
class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();
  factory DeepLinkService() => _instance;
  DeepLinkService._internal();

  final AppLinks _appLinks = AppLinks();
  StreamSubscription<Uri>? _subscription;
  GlobalKey<NavigatorState>? _navigatorKey;

  /// Call once from main.dart after the app is built.
  void init(GlobalKey<NavigatorState> navigatorKey) {
    _navigatorKey = navigatorKey;

    // Handle links that opened the app from a cold start
    _appLinks.getInitialLink().then(_handleUri);

    // Handle links while the app is already running
    _subscription = _appLinks.uriLinkStream.listen(_handleUri);
  }

  void _handleUri(Uri? uri) {
    if (uri == null) return;
    debugPrint('[DeepLink] Received URI: $uri');

    final segments = uri.pathSegments;

    // Matches: tapfolio://connect/USERNAME  or  https://tapfolio.me/connect/USERNAME
    if (segments.length >= 2 && segments[0] == 'connect') {
      final username = segments[1];
      if (username.isNotEmpty) {
        _navigateToConnect(username);
      }
    }
  }

  void _navigateToConnect(String username) {
    final context = _navigatorKey?.currentContext;
    if (context == null) return;

    // Import done at call site to avoid circular deps; we use dynamic navigation
    Navigator.of(context, rootNavigator: true).pushNamed(
      '/connect',
      arguments: username,
    );
  }

  void dispose() {
    _subscription?.cancel();
  }
}
