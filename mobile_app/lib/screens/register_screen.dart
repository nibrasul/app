import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const RegisterScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final ApiService _apiService = ApiService();

  int _step = 1;
  bool _isLoading = false;
  String? _errorMessage;

  // Step 1: Basic Identity Controllers
  final _formKey1 = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  // Username validation
  Timer? _debounceTimer;
  bool _isCheckingUsername = false;
  bool _isUsernameAvailable = false;
  List<String> _usernameSuggestions = [];
  String? _usernameError;

  // Step 2: Onboarding - Tagline & Bio & Avatar
  final _taglineController = TextEditingController();
  final _bioController = TextEditingController();
  String _avatar = '/profile_avatar.png';
  int? _selectedPresetIdx;

  // Step 3: Default Sharing Preferences
  bool _shareName = true;
  bool _shareEmail = true;
  bool _sharePhone = false;
  bool _shareWhatsapp = true;
  bool _shareLocation = false;

  // Step 4: Social Links Handles
  final _githubController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _instagramController = TextEditingController();
  final _portfolioController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _usernameController.addListener(_onUsernameChanged);
  }

  @override
  void dispose() {
    _usernameController.removeListener(_onUsernameChanged);
    _debounceTimer?.cancel();
    _nameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _taglineController.dispose();
    _bioController.dispose();
    _githubController.dispose();
    _linkedinController.dispose();
    _instagramController.dispose();
    _portfolioController.dispose();
    super.dispose();
  }

  void _onUsernameChanged() {
    if (_debounceTimer?.isActive ?? false) _debounceTimer?.cancel();

    final input = _usernameController.text.trim().toLowerCase();
    if (input.isEmpty) {
      setState(() {
        _isUsernameAvailable = false;
        _usernameSuggestions = [];
        _usernameError = null;
        _isCheckingUsername = false;
      });
      return;
    }

    if (!RegExp(r'^[a-z0-9_-]{3,20}$').hasMatch(input)) {
      setState(() {
        _isUsernameAvailable = false;
        _usernameError = '3-20 chars: lowercase, numbers, - or _ only';
        _usernameSuggestions = [];
        _isCheckingUsername = false;
      });
      return;
    }

    setState(() {
      _isCheckingUsername = true;
      _usernameError = null;
    });

    _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
      final res = await _apiService.checkUsernameAvailability(input);
      if (mounted) {
        setState(() {
          _isCheckingUsername = false;
          if (res['success'] == true) {
            _isUsernameAvailable = res['available'] ?? false;
            _usernameSuggestions = List<String>.from(res['suggestions'] ?? []);
          } else {
            _usernameError = res['error'];
          }
        });
      }
    });
  }

  Future<void> _handleStep1Submit() async {
    if (!_formKey1.currentState!.validate()) return;
    if (!_isUsernameAvailable) {
      setState(() {
        _errorMessage = 'Please choose an available username';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final name = _nameController.text.trim();
    final username = _usernameController.text.trim().toLowerCase();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // Register user
    final regRes = await _apiService.register(name, username, email, password);
    if (regRes['success'] == true) {
      // Auto login
      final logRes = await _apiService.login(email, password);
      if (logRes['success'] == true) {
        // Init profile
        await _apiService.initProfile();
        setState(() {
          _step = 2;
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Account created, but sign-in failed. Try again.';
        });
      }
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = regRes['error'];
      });
    }
  }

  // Preset Selection Generator
  void _selectPresetAvatar(int index) {
    setState(() {
      _selectedPresetIdx = index;
      // Define a placeholder preset color string
      _avatar = 'preset_grad_$index';
    });
  }

  // Step 5: Send single payload to onboarding endpoint
  Future<void> _handleFinalSubmit() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final socialsList = <Map<String, String>>[];
    if (_githubController.text.trim().isNotEmpty) {
      socialsList.add({
        'platform': 'GitHub',
        'handle': _githubController.text.trim(),
        'url': 'https://github.com/${_githubController.text.trim()}',
      });
    }
    if (_linkedinController.text.trim().isNotEmpty) {
      socialsList.add({
        'platform': 'LinkedIn',
        'handle': _linkedinController.text.trim(),
        'url': 'https://linkedin.com/in/${_linkedinController.text.trim()}',
      });
    }
    if (_instagramController.text.trim().isNotEmpty) {
      socialsList.add({
        'platform': 'Instagram',
        'handle': _instagramController.text.trim(),
        'url': 'https://instagram.com/${_instagramController.text.trim()}',
      });
    }
    if (_portfolioController.text.trim().isNotEmpty) {
      socialsList.add({
        'platform': 'Portfolio',
        'handle': 'Website',
        'url': _portfolioController.text.trim().startsWith('http')
            ? _portfolioController.text.trim()
            : 'https://${_portfolioController.text.trim()}',
      });
    }

    final payload = {
      'tagline': _taglineController.text.trim().isEmpty ? "Let's connect!" : _taglineController.text.trim(),
      'bio': _bioController.text.trim().isEmpty ? "I design meaningful experiences." : _bioController.text.trim(),
      'avatar': _avatar,
      'socials': socialsList,
      'sharingSettings': {
        'shareName': _shareName,
        'shareEmail': _shareEmail,
        'sharePhone': _sharePhone,
        'shareWhatsapp': _shareWhatsapp,
        'shareLocation': _shareLocation,
      }
    };

    final res = await _apiService.submitOnboarding(payload);
    if (res['success'] == true) {
      // Success! Auto login trigger
      widget.onLoginSuccess();
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = res['error'];
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
        color: Colors.white.withOpacity(0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        style: GoogleFonts.outfit(color: Colors.white),
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: GoogleFonts.outfit(color: Colors.white60, fontSize: 14),
          prefixIcon: Icon(icon, color: Colors.indigoAccent, size: 20),
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(5, (index) {
        final stepNum = index + 1;
        final isActive = _step == stepNum;
        final isCompleted = _step > stepNum;
        return Column(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted
                    ? Colors.purple
                    : isActive
                        ? Colors.indigoAccent
                        : const Color(0xFF161824),
                border: Border.all(
                  color: isActive ? Colors.indigoAccent : Colors.white10,
                ),
              ),
              child: Center(
                child: Text(
                  '$stepNum',
                  style: TextStyle(
                    color: isActive || isCompleted ? Colors.white : Colors.white38,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              stepNum == 1 ? 'Info' : stepNum == 2 ? 'Profile' : stepNum == 3 ? 'Privacy' : stepNum == 4 ? 'Social' : 'Finish',
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white30,
                fontSize: 9,
                fontWeight: FontWeight.w600,
              ),
            )
          ],
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0b0c10),
      body: Stack(
        children: [
          // Ambient Glow Backgrounds
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.purple.withOpacity(0.1),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                child: Container(color: Colors.transparent),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Header indicators
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tapfolio',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text(
                          'Cancel',
                          style: GoogleFonts.outfit(color: Colors.white54),
                        ),
                      )
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
                  child: _buildStepIndicator(),
                ),
                const SizedBox(height: 16),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.02),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.06)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_errorMessage != null) ...[
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  margin: const EdgeInsets.only(bottom: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.redAccent.withOpacity(0.08),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
                                  ),
                                  child: Text(
                                    _errorMessage!,
                                    style: GoogleFonts.outfit(color: Colors.redAccent, fontSize: 13),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],

                              // STEP 1: IDENTITY DETAILS
                              if (_step == 1) ...[
                                Text(
                                  'Create account',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 16),
                                Form(
                                  key: _formKey1,
                                  child: Column(
                                    children: [
                                      _buildGlassTextField(
                                        controller: _nameController,
                                        label: 'Full Name',
                                        icon: Icons.person_outline,
                                        validator: (val) => val == null || val.trim().isEmpty ? 'Name is required' : null,
                                      ),
                                      _buildGlassTextField(
                                        controller: _usernameController,
                                        label: 'Username',
                                        icon: Icons.alternate_email,
                                        validator: (val) => val == null || val.trim().isEmpty ? 'Username is required' : null,
                                      ),
                                      
                                      // Username checking outputs
                                      if (_isCheckingUsername)
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 16.0),
                                          child: Text('Checking availability...', style: TextStyle(color: Colors.white54, fontSize: 12)),
                                        ),
                                      if (_isUsernameAvailable && _usernameController.text.trim().isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 16.0),
                                          child: Text('✅ Username is available!', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                                        ),
                                      if (!_isUsernameAvailable && _usernameController.text.trim().isNotEmpty && !_isCheckingUsername)
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 16.0),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('❌ Taken: ${_usernameError ?? 'Try another.'}', style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                                              if (_usernameSuggestions.isNotEmpty) ...[
                                                const SizedBox(height: 8),
                                                Text('Suggestions:', style: GoogleFonts.outfit(fontSize: 11, color: Colors.white38)),
                                                const SizedBox(height: 4),
                                                Wrap(
                                                  spacing: 8,
                                                  children: _usernameSuggestions.map((s) => ActionChip(
                                                    backgroundColor: Colors.white.withOpacity(0.05),
                                                    label: Text(s, style: const TextStyle(color: Colors.indigoAccent, fontSize: 11)),
                                                    onPressed: () => _usernameController.text = s,
                                                  )).toList(),
                                                ),
                                              ],
                                            ],
                                          ),
                                        ),

                                      _buildGlassTextField(
                                        controller: _emailController,
                                        label: 'Email Address',
                                        icon: Icons.email_outlined,
                                        validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                                      ),
                                      _buildGlassTextField(
                                        controller: _passwordController,
                                        label: 'Password',
                                        icon: Icons.lock_outline,
                                        obscureText: _obscurePassword,
                                        validator: (val) => val == null || val.length < 6 ? 'Password must be 6+ characters' : null,
                                        suffixIcon: IconButton(
                                          icon: Icon(
                                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                            color: Colors.white54,
                                            size: 20,
                                          ),
                                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 48,
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.indigoAccent,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          onPressed: _isLoading ? null : _handleStep1Submit,
                                          child: _isLoading
                                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                              : Text('Continue', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              ],

                              // STEP 2: PROFILE DETAILS
                              if (_step == 2) ...[
                                Text(
                                  'Profile details',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 16),
                                
                                // Preset Avatars selector
                                Text('Choose Preset Color Avatar:', style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13)),
                                const SizedBox(height: 12),
                                SizedBox(
                                  height: 44,
                                  child: ListView.builder(
                                    scrollDirection: Axis.horizontal,
                                    itemCount: 6,
                                    itemBuilder: (context, idx) {
                                      final colors = [
                                        [const Color(0xFFf59e0b), const Color(0xFFef4444)],
                                        [const Color(0xFF10b981), const Color(0xFF3b82f6)],
                                        [const Color(0xFF6366f1), const Color(0xFFa855f7)],
                                        [const Color(0xFFec4899), const Color(0xFFf43f5e)],
                                        [const Color(0xFF06b6d4), const Color(0xFF0891b2)],
                                        [const Color(0xFF84cc16), const Color(0xFF10b981)]
                                      ];
                                      final isSelected = _selectedPresetIdx == idx;
                                      return GestureDetector(
                                        onTap: () => _selectPresetAvatar(idx),
                                        child: Container(
                                          width: 36,
                                          height: 36,
                                          margin: const EdgeInsets.only(right: 12),
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            gradient: LinearGradient(colors: colors[idx]),
                                            border: Border.all(
                                              color: isSelected ? Colors.white : Colors.transparent,
                                              width: 2.5,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              _nameController.text.isNotEmpty ? _nameController.text.substring(0, 1).toUpperCase() : 'T',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white),
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(height: 20),

                                _buildGlassTextField(
                                  controller: _taglineController,
                                  label: 'Tagline / Professional headline',
                                  icon: Icons.title_outlined,
                                ),
                                Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.04),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                                  ),
                                  child: TextFormField(
                                    controller: _bioController,
                                    maxLines: 3,
                                    style: GoogleFonts.outfit(color: Colors.white),
                                    decoration: InputDecoration(
                                      labelText: 'Bio',
                                      labelStyle: GoogleFonts.outfit(color: Colors.white60, fontSize: 14),
                                      prefixIcon: const Icon(Icons.info_outline, color: Colors.indigoAccent),
                                      border: InputBorder.none,
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.indigoAccent),
                                    onPressed: () => setState(() => _step = 3),
                                    child: Text('Next: Sharing Settings', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],

                              // STEP 3: PRIVACY PREFERENCES
                              if (_step == 3) ...[
                                Text(
                                  'Privacy Preferences',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 16),
                                SwitchListTile(
                                  title: const Text('Share Name', style: TextStyle(color: Colors.white)),
                                  subtitle: const Text('Always share name in profile connects', style: TextStyle(color: Colors.white38, fontSize: 11)),
                                  value: _shareName,
                                  onChanged: null, // Always checked & disabled
                                ),
                                SwitchListTile(
                                  title: const Text('Share Email', style: TextStyle(color: Colors.white)),
                                  value: _shareEmail,
                                  onChanged: (val) => setState(() => _shareEmail = val),
                                ),
                                SwitchListTile(
                                  title: const Text('Share Phone', style: TextStyle(color: Colors.white)),
                                  value: _sharePhone,
                                  onChanged: (val) => setState(() => _sharePhone = val),
                                ),
                                SwitchListTile(
                                  title: const Text('Share WhatsApp', style: TextStyle(color: Colors.white)),
                                  value: _shareWhatsapp,
                                  onChanged: (val) => setState(() => _shareWhatsapp = val),
                                ),
                                SwitchListTile(
                                  title: const Text('Share Location', style: TextStyle(color: Colors.white)),
                                  value: _shareLocation,
                                  onChanged: (val) => setState(() => _shareLocation = val),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.indigoAccent),
                                    onPressed: () => setState(() => _step = 4),
                                    child: Text('Next: Social Links', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],

                              // STEP 4: SOCIAL LINKS
                              if (_step == 4) ...[
                                Text(
                                  'Social handles',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 16),
                                _buildGlassTextField(
                                  controller: _githubController,
                                  label: 'GitHub Username',
                                  icon: Icons.code,
                                ),
                                _buildGlassTextField(
                                  controller: _linkedinController,
                                  label: 'LinkedIn Handle',
                                  icon: Icons.link,
                                ),
                                _buildGlassTextField(
                                  controller: _instagramController,
                                  label: 'Instagram username',
                                  icon: Icons.photo_camera,
                                ),
                                _buildGlassTextField(
                                  controller: _portfolioController,
                                  label: 'Portfolio URL',
                                  icon: Icons.public,
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.indigoAccent),
                                    onPressed: () => setState(() => _step = 5),
                                    child: Text('Next: Finalize', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],

                              // STEP 5: PREVIEW & COMMIT
                              if (_step == 5) ...[
                                Text(
                                  'Review your Card',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 16),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.04),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                                  ),
                                  child: Column(
                                    children: [
                                      Container(
                                        width: 54,
                                        height: 54,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: Colors.purple.withOpacity(0.3),
                                        ),
                                        child: Center(
                                          child: Text(
                                            _nameController.text.substring(0,1).toUpperCase(),
                                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        _nameController.text,
                                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                      ),
                                      Text(
                                        '@${_usernameController.text}',
                                        style: GoogleFonts.outfit(fontSize: 12, color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                                      ),
                                      if (_taglineController.text.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          _taglineController.text,
                                          style: GoogleFonts.outfit(fontSize: 12, color: Colors.white60),
                                        ),
                                      ],
                                      if (_bioController.text.isNotEmpty) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          _bioController.text,
                                          style: GoogleFonts.outfit(fontSize: 11, color: Colors.white30),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.indigoAccent,
                                      elevation: 4,
                                    ),
                                    onPressed: _isLoading ? null : _handleFinalSubmit,
                                    child: _isLoading
                                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                        : Text('Create My Tapfolio Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
