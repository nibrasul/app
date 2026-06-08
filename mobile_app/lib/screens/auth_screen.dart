import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class AuthScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const AuthScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  _AuthScreenState createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();

  // Login Form
  final _loginFormKey = GlobalKey<FormState>();
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  // Register Form
  final _registerFormKey = GlobalKey<FormState>();
  final _registerNameController = TextEditingController();
  final _registerUsernameController = TextEditingController();
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;
  bool _obscureLoginPassword = true;
  bool _obscureRegisterPassword = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _registerNameController.dispose();
    _registerUsernameController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_loginFormKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final email = _loginEmailController.text.trim();
    final password = _loginPasswordController.text;

    final result = await _apiService.login(email, password);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      widget.onLoginSuccess();
    } else {
      setState(() {
        _errorMessage = result['error'];
      });
    }
  }

  Future<void> _handleRegister() async {
    if (!_registerFormKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final name = _registerNameController.text.trim();
    final username = _registerUsernameController.text.trim().toLowerCase();
    final email = _registerEmailController.text.trim();
    final password = _registerPasswordController.text;

    final result = await _apiService.register(name, username, email, password);

    setState(() {
      _isLoading = false;
    });

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration successful! Please sign in.'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      _tabController.animateTo(0); // Switch to Login Tab
      _loginEmailController.text = email;
      _registerNameController.clear();
      _registerUsernameController.clear();
      _registerEmailController.clear();
      _registerPasswordController.clear();
    } else {
      setState(() {
        _errorMessage = result['error'];
      });
    }
  }

  Widget _buildGlassTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    String? Function(String?)? validator,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        style: GoogleFonts.outfit(color: Colors.white),
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: GoogleFonts.outfit(color: Colors.white60),
          prefixIcon: Icon(icon, color: Colors.indigoAccent),
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F16),
      body: Stack(
        children: [
          // Background Glows
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.indigo.withOpacity(0.3),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            right: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.indigoAccent.withOpacity(0.2),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),

          // Main Content
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Text(
                    'Tapfolio',
                    style: GoogleFonts.outfit(
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Smart NFC Portfolios & Connections',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      color: Colors.white70,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 40),

                  // Glassmorphic Auth Panel
                  ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                        ),
                        child: Column(
                          children: [
                            // Tab Bar
                            TabBar(
                              controller: _tabController,
                              indicatorColor: Colors.indigoAccent,
                              indicatorWeight: 3,
                              labelColor: Colors.white,
                              unselectedLabelColor: Colors.white38,
                              labelStyle: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w600),
                              tabs: const [
                                Tab(text: 'Sign In'),
                                Tab(text: 'Sign Up'),
                              ],
                            ),

                            Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: AnimatedSize(
                                duration: const Duration(milliseconds: 300),
                                child: SizedBox(
                                  height: _tabController.index == 0 ? 250 : 380,
                                  child: TabBarView(
                                    controller: _tabController,
                                    children: [
                                      // Sign In Form
                                      Form(
                                        key: _loginFormKey,
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            _buildGlassTextField(
                                              controller: _loginEmailController,
                                              label: 'Email Address',
                                              icon: Icons.email_outlined,
                                              validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                                            ),
                                            _buildGlassTextField(
                                              controller: _loginPasswordController,
                                              label: 'Password',
                                              icon: Icons.lock_outline,
                                              obscureText: _obscureLoginPassword,
                                              validator: (val) => val == null || val.length < 6 ? 'Password must be 6+ characters' : null,
                                              suffixIcon: IconButton(
                                                icon: Icon(
                                                  _obscureLoginPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                                  color: Colors.white60,
                                                ),
                                                onPressed: () {
                                                  setState(() {
                                                    _obscureLoginPassword = !_obscureLoginPassword;
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(height: 20),
                                            if (_errorMessage != null)
                                              Padding(
                                                padding: const EdgeInsets.only(bottom: 16.0),
                                                child: Text(
                                                  _errorMessage!,
                                                  style: const TextStyle(color: Colors.redAccent),
                                                  textAlign: TextAlign.center,
                                                ),
                                              ),
                                            SizedBox(
                                              width: double.infinity,
                                              height: 50,
                                              child: ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.indigoAccent,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(12),
                                                  ),
                                                ),
                                                onPressed: _isLoading ? null : _handleLogin,
                                                child: _isLoading
                                                    ? const CircularProgressIndicator(color: Colors.white)
                                                    : Text(
                                                        'Sign In',
                                                        style: GoogleFonts.outfit(
                                                          fontSize: 16,
                                                          fontWeight: FontWeight.bold,
                                                          color: Colors.white,
                                                        ),
                                                      ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),

                                      // Sign Up Form
                                      Form(
                                        key: _registerFormKey,
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            _buildGlassTextField(
                                              controller: _registerNameController,
                                              label: 'Full Name',
                                              icon: Icons.person_outline,
                                              validator: (val) => val == null || val.isEmpty ? 'Enter your name' : null,
                                            ),
                                            _buildGlassTextField(
                                              controller: _registerUsernameController,
                                              label: 'Username',
                                              icon: Icons.alternate_email_outlined,
                                              validator: (val) {
                                                if (val == null || val.trim().isEmpty) return 'Enter a username';
                                                if (val.trim().length < 3 || val.trim().length > 20) {
                                                  return 'Username must be 3-20 characters';
                                                }
                                                if (!RegExp(r'^[a-z0-9_-]+$').hasMatch(val.trim().toLowerCase())) {
                                                  return 'Only letters, numbers, -, and _ allowed';
                                                }
                                                return null;
                                              },
                                            ),
                                            _buildGlassTextField(
                                              controller: _registerEmailController,
                                              label: 'Email Address',
                                              icon: Icons.email_outlined,
                                              validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                                            ),
                                            _buildGlassTextField(
                                              controller: _registerPasswordController,
                                              label: 'Password',
                                              icon: Icons.lock_outline,
                                              obscureText: _obscureRegisterPassword,
                                              validator: (val) => val == null || val.length < 6 ? 'Password must be 6+ characters' : null,
                                              suffixIcon: IconButton(
                                                icon: Icon(
                                                  _obscureRegisterPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                                  color: Colors.white60,
                                                ),
                                                onPressed: () {
                                                  setState(() {
                                                    _obscureRegisterPassword = !_obscureRegisterPassword;
                                                  });
                                                },
                                              ),
                                            ),
                                            const SizedBox(height: 20),
                                            if (_errorMessage != null)
                                              Padding(
                                                padding: const EdgeInsets.only(bottom: 16.0),
                                                child: Text(
                                                  _errorMessage!,
                                                  style: const TextStyle(color: Colors.redAccent),
                                                  textAlign: TextAlign.center,
                                                ),
                                              ),
                                            SizedBox(
                                              width: double.infinity,
                                              height: 50,
                                              child: ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor: Colors.indigoAccent,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(12),
                                                  ),
                                                ),
                                                onPressed: _isLoading ? null : _handleRegister,
                                                child: _isLoading
                                                    ? const CircularProgressIndicator(color: Colors.white)
                                                    : Text(
                                                        'Create Account',
                                                        style: GoogleFonts.outfit(
                                                          fontSize: 16,
                                                          fontWeight: FontWeight.bold,
                                                          color: Colors.white,
                                                        ),
                                                      ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
