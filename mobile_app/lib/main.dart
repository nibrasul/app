import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/api_service.dart';
import 'screens/auth_screen.dart';
import 'screens/main_navigation_shell.dart';

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
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Tapfolio',
      debugShowCheckedModeBanner: false,
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
