import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/api_service.dart';
import 'services/deep_link_service.dart';
import 'screens/auth_screen.dart';
import 'screens/main_navigation_shell.dart';
import 'screens/connect_screen.dart';
import 'screens/connections_screen.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final apiService = ApiService();
  await apiService.init();

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final ApiService _apiService = ApiService();
  bool _checkingAuth = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkInitialAuth();
  }

  Future<void> _checkInitialAuth() async {
    final user = await _apiService.getMe();
    setState(() {
      _isAuthenticated = user != null;
      _checkingAuth = false;
    });
    // Init deep link service after build so navigator is ready
    WidgetsBinding.instance.addPostFrameCallback((_) {
      DeepLinkService().init(navigatorKey);
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tapfolio',
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.indigoAccent,
        scaffoldBackgroundColor: const Color(0xFF0F0F16),
        textTheme: GoogleFonts.outfitTextTheme(
          ThemeData.dark().textTheme,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigoAccent,
          brightness: Brightness.dark,
          background: const Color(0xFF0F0F16),
        ),
      ),
      onGenerateRoute: (settings) {
        if (settings.name == '/connect') {
          final username = settings.arguments as String? ?? '';
          return MaterialPageRoute(
            builder: (_) => ConnectScreen(username: username),
          );
        }
        if (settings.name == '/connections') {
          return MaterialPageRoute(
            builder: (_) => const ConnectionsScreen(),
          );
        }
        return null;
      },
      home: _checkingAuth
          ? const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: Colors.indigoAccent),
              ),
            )
          : _isAuthenticated
              ? MainNavigationShell(
                  onLogout: () {
                    setState(() {
                      _isAuthenticated = false;
                    });
                  },
                )
              : AuthScreen(
                  onLoginSuccess: () {
                    setState(() {
                      _isAuthenticated = true;
                    });
                  },
                ),
    );
  }
}
