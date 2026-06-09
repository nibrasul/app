import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const RegisterScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final ApiService _apiService = ApiService();
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  int _step = 1;
  bool _isLoading = false;
  String? _errorMessage;

  // Step 2: Account Creation
  final _formKey2 = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  // Step 4: Username Customization
  final _usernameController = TextEditingController();
  Timer? _debounceTimer;
  bool _isCheckingUsername = false;
  bool _isUsernameAvailable = true; // default true for auto-generated initial username
  List<String> _usernameSuggestions = [];
  String? _usernameError;

  // Step 5: Profile Details (Avatar, Tagline, Bio)
  final _taglineController = TextEditingController();
  final _bioController = TextEditingController();
  String _avatar = '/profile_avatar.png';
  int? _selectedPresetIdx;

  // Step 6: Sharing Preferences
  bool _shareName = true;
  bool _shareEmail = true;
  bool _sharePhone = false;
  bool _shareWhatsapp = true;
  bool _shareLocation = false;

  // Step 7: Social Links
  final _githubController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _instagramController = TextEditingController();
  final _portfolioController = TextEditingController();

  // Draft persistence methods
  Future<void> _saveOnboardingDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('draft_tagline', _taglineController.text);
      await prefs.setString('draft_bio', _bioController.text);
      await prefs.setString('draft_avatar', _avatar);
      await prefs.setString('draft_github', _githubController.text);
      await prefs.setString('draft_linkedin', _linkedinController.text);
      await prefs.setString('draft_instagram', _instagramController.text);
      await prefs.setString('draft_portfolio', _portfolioController.text);
      await prefs.setBool('draft_share_email', _shareEmail);
      await prefs.setBool('draft_share_phone', _sharePhone);
      await prefs.setBool('draft_share_whatsapp', _shareWhatsapp);
      await prefs.setBool('draft_share_location', _shareLocation);
    } catch (e) {
      debugPrint('Error saving onboarding draft: $e');
    }
  }

  Future<void> _loadOnboardingDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (prefs.containsKey('draft_tagline')) {
        setState(() {
          _taglineController.text = prefs.getString('draft_tagline') ?? '';
          _bioController.text = prefs.getString('draft_bio') ?? '';
          _avatar = prefs.getString('draft_avatar') ?? '/profile_avatar.png';
          _githubController.text = prefs.getString('draft_github') ?? '';
          _linkedinController.text = prefs.getString('draft_linkedin') ?? '';
          _instagramController.text = prefs.getString('draft_instagram') ?? '';
          _portfolioController.text = prefs.getString('draft_portfolio') ?? '';
          _shareEmail = prefs.getBool('draft_share_email') ?? true;
          _sharePhone = prefs.getBool('draft_share_phone') ?? false;
          _shareWhatsapp = prefs.getBool('draft_share_whatsapp') ?? true;
          _shareLocation = prefs.getBool('draft_share_location') ?? false;
        });
      }
    } catch (e) {
      debugPrint('Error loading onboarding draft: $e');
    }
  }

  Future<void> _clearOnboardingDraft() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('draft_tagline');
      await prefs.remove('draft_bio');
      await prefs.remove('draft_avatar');
      await prefs.remove('draft_github');
      await prefs.remove('draft_linkedin');
      await prefs.remove('draft_instagram');
      await prefs.remove('draft_portfolio');
      await prefs.remove('draft_share_email');
      await prefs.remove('draft_share_phone');
      await prefs.remove('draft_share_whatsapp');
      await prefs.remove('draft_share_location');
    } catch (e) {
      debugPrint('Error clearing onboarding draft: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    _usernameController.addListener(_onUsernameChanged);
    _loadOnboardingDraft();
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

  Future<void> _handleStep2Submit() async {
    if (!_formKey2.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // Register user (passing empty username so backend auto-generates it)
    final regRes = await _apiService.register(name, '', email, password);
    if (regRes['success'] == true) {
      // Auto login
      final logRes = await _apiService.login(email, password);
      if (logRes['success'] == true) {
        // Init profile
        final initRes = await _apiService.initProfile();
        if (initRes['success'] == true) {
          final generatedUsername = initRes['profile']['username'] ?? '';
          setState(() {
            _usernameController.text = generatedUsername;
            _step = 3; // Go directly to success celebration!
            _isLoading = false;
          });
        } else {
          setState(() {
            _isLoading = false;
            _errorMessage = 'Account created, but profile initialization failed.';
          });
        }
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

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account != null) {
        final GoogleSignInAuthentication auth = await account.authentication;
        final res = await _apiService.googleLogin(
          auth.idToken ?? 'mock_token',
          email: account.email,
          name: account.displayName,
        );

        if (res['success'] == true) {
          // Initialize profile to get default generated username
          final initRes = await _apiService.initProfile();
          if (initRes['success'] == true) {
            setState(() {
              _nameController.text = account.displayName ?? 'Google User';
              _emailController.text = account.email;
              _usernameController.text = initRes['profile']['username'] ?? '';
              _step = 3; // Go directly to success moment!
              _isLoading = false;
            });
          } else {
            setState(() {
              _isLoading = false;
              _errorMessage = 'Login succeeded, but profile initialization failed.';
            });
          }
        } else {
          setState(() {
            _isLoading = false;
            _errorMessage = res['error'];
          });
        }
      } else {
        // User cancelled
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      _showMockGoogleSignInDialog();
    }
  }

  void _showMockGoogleSignInDialog() {
    final mockEmailController = TextEditingController(text: 'test.google@tapfolio.me');
    final mockNameController = TextEditingController(text: 'Google Explorer');

    setState(() {
      _isLoading = false;
    });

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161824),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Google Sign-Up (Dev Fallback)',
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Your Google Sign-In SDK is unconfigured on this build. Enter mock details to simulate signup:',
              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: mockNameController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Full Name',
                labelStyle: const TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.2))),
              ),
            ),
            TextField(
              controller: mockEmailController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Email Address',
                labelStyle: const TextStyle(color: Colors.white60),
                enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.2))),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: Text('Cancel', style: GoogleFonts.outfit(color: Colors.white60)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.indigoAccent),
            child: Text('Sign Up', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold)),
            onPressed: () async {
              Navigator.pop(ctx);
              setState(() {
                _isLoading = true;
              });

              final randomSuffix = math.Random().nextInt(1000);
              final res = await _apiService.googleLogin(
                'mock_google_token_${mockEmailController.text.split('@')[0]}_$randomSuffix',
                email: mockEmailController.text.trim(),
                name: mockNameController.text.trim(),
              );

              if (res['success'] == true) {
                // Initialize profile
                final initRes = await _apiService.initProfile();
                if (initRes['success'] == true) {
                  setState(() {
                    _nameController.text = mockNameController.text.trim();
                    _emailController.text = mockEmailController.text.trim();
                    _usernameController.text = initRes['profile']['username'] ?? '';
                    _step = 3; // Success Moment!
                    _isLoading = false;
                  });
                } else {
                  setState(() {
                    _isLoading = false;
                    _errorMessage = 'Login succeeded, but profile initialization failed.';
                  });
                }
              } else {
                setState(() {
                  _isLoading = false;
                  _errorMessage = res['error'];
                });
              }
            },
          ),
        ],
      ),
    );
  }

  Future<void> _handleStep4Submit() async {
    final cleanUsername = _usernameController.text.trim().toLowerCase();
    if (cleanUsername.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter a username';
      });
      return;
    }

    if (!_isUsernameAvailable) {
      setState(() {
        _errorMessage = 'Please choose a unique available username';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await _apiService.submitOnboarding({'username': cleanUsername});
    if (res['success'] == true) {
      setState(() {
        _step = 5;
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = res['error'] ?? 'Failed to update username.';
      });
    }
  }

  // Preset Selection Generator
  void _selectPresetAvatar(int index) {
    setState(() {
      _selectedPresetIdx = index;
      _avatar = 'preset_grad_$index';
    });
  }

  // Step 7: Send single payload to onboarding endpoint
  Future<void> _handleFinalSubmit({bool skip = false}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final socialsList = <Map<String, String>>[];
    if (!skip) {
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

    int attempts = 0;
    bool success = false;
    dynamic lastError;

    while (attempts < 3 && !success) {
      attempts++;
      debugPrint('[ONBOARDING] Submission attempt $attempts of 3...');
      try {
        final res = await _apiService.submitOnboarding(payload);
        if (res['success'] == true) {
          success = true;
        } else {
          lastError = res['error'];
          debugPrint('[ONBOARDING] Attempt $attempts failed with error: $lastError');
          if (attempts < 3) {
            await Future.delayed(const Duration(seconds: 1));
          }
        }
      } catch (e) {
        lastError = e.toString();
        debugPrint('[ONBOARDING] Attempt $attempts caught exception: $lastError');
        if (attempts < 3) {
          await Future.delayed(const Duration(seconds: 1));
        }
      }
    }

    if (success) {
      debugPrint('[ONBOARDING] Onboarding committed successfully on attempt $attempts.');
      await _clearOnboardingDraft();
      widget.onLoginSuccess();
    } else {
      debugPrint('[ONBOARDING] Onboarding failed all 3 attempts. Saving draft locally.');
      await _saveOnboardingDraft();
      setState(() {
        _isLoading = false;
        _errorMessage = '${lastError ?? "Network error"} (Draft saved locally, 3 attempts failed)';
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
          labelStyle: GoogleFonts.outfit(color: Colors.white54, fontSize: 14),
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
      children: List.generate(7, (index) {
        final stepNum = index + 1;
        final isActive = _step == stepNum;
        final isCompleted = _step > stepNum;
        return Column(
          children: [
            Container(
              width: 24,
              height: 24,
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
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              stepNum == 1 ? 'Welcome' :
              stepNum == 2 ? 'Register' :
              stepNum == 3 ? 'Live' :
              stepNum == 4 ? 'Link' :
              stepNum == 5 ? 'Bio' :
              stepNum == 6 ? 'Privacy' : 'Social',
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white30,
                fontSize: 8,
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
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
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

                              // STEP 1: WELCOME SCREEN
                              if (_step == 1) ...[
                                Align(
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Your professional identity.\nOne tap away.',
                                    style: GoogleFonts.outfit(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                      height: 1.3,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Align(
                                  alignment: Alignment.center,
                                  child: Text(
                                    'Build and share a premium digital NFC profile in seconds.',
                                    style: GoogleFonts.outfit(fontSize: 13, color: Colors.white60),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                
                                // Benefits List
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.02),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Colors.white.withOpacity(0.04)),
                                  ),
                                  child: Column(
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.bolt, color: Colors.amberAccent, size: 20),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              'Share your profile instantly via NFC',
                                              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.people_outline, color: Colors.indigoAccent, size: 20),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              'Connect and network with nearby builders',
                                              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.lock_outline, color: Colors.greenAccent, size: 20),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              'Fully control your sharing visibilities',
                                              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),

                                // Action Buttons
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      backgroundColor: Colors.white.withOpacity(0.02),
                                    ),
                                    onPressed: _handleGoogleSignIn,
                                    icon: Image.network(
                                      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/24px-Google_%22G%22_logo.svg.png',
                                      height: 20,
                                    ),
                                    label: Text(
                                      'Continue with Google',
                                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.indigoAccent,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () => setState(() => _step = 2),
                                    child: Text(
                                      'Continue with Email',
                                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Align(
                                  alignment: Alignment.center,
                                  child: InkWell(
                                    onTap: () => Navigator.pop(context),
                                    child: RichText(
                                      text: TextSpan(
                                        text: 'Already have an account? ',
                                        style: GoogleFonts.outfit(color: Colors.white54, fontSize: 13),
                                        children: [
                                          TextSpan(
                                            text: 'Sign In',
                                            style: GoogleFonts.outfit(color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],

                              // STEP 2: ACCOUNT CREATION (Name, Email, Pass only)
                              if (_step == 2) ...[
                                Text(
                                  'Create Account',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Register to go live instantly',
                                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                                ),
                                const SizedBox(height: 16),
                                Form(
                                  key: _formKey2,
                                  child: Column(
                                    children: [
                                      _buildGlassTextField(
                                        controller: _nameController,
                                        label: 'Full Name',
                                        icon: Icons.person_outline,
                                        validator: (val) => val == null || val.trim().isEmpty ? 'Name is required' : null,
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
                                          onPressed: _isLoading ? null : _handleStep2Submit,
                                          child: _isLoading
                                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                              : Text('Create Account', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              // STEP 3: FIRST SUCCESS MOMENT
                              if (_step == 3) ...[
                                Align(
                                  alignment: Alignment.center,
                                  child: Column(
                                    children: [
                                      Text(
                                        'Welcome, ${_nameController.text.split(" ")[0]}! 🎉',
                                        style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Your profile is live!',
                                        style: GoogleFonts.outfit(fontSize: 16, color: Colors.greenAccent, fontWeight: FontWeight.bold),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 24),

                                      // Glassmorphic preview card representation
                                      Container(
                                        width: double.infinity,
                                        padding: const EdgeInsets.all(24),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.04),
                                          borderRadius: BorderRadius.circular(16),
                                          border: Border.all(color: Colors.white.withOpacity(0.08)),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.indigoAccent.withOpacity(0.1),
                                              blurRadius: 20,
                                              spreadRadius: 2,
                                            ),
                                          ],
                                        ),
                                        child: Column(
                                          children: [
                                            Container(
                                              width: 64,
                                              height: 64,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: Colors.purple.withOpacity(0.3),
                                                border: Border.all(color: Colors.indigoAccent, width: 2),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  _nameController.text.isNotEmpty ? _nameController.text.substring(0, 1).toUpperCase() : 'T',
                                                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 22),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(height: 12),
                                            Text(
                                              _nameController.text,
                                              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                                            ),
                                            Text(
                                              '@${_usernameController.text}',
                                              style: GoogleFonts.outfit(fontSize: 13, color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                                            ),
                                            const SizedBox(height: 12),
                                            Text(
                                              'tapfolio.me/@${_usernameController.text}',
                                              style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 28),

                                      SizedBox(
                                        width: double.infinity,
                                        height: 48,
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.indigoAccent,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          onPressed: () => setState(() => _step = 4),
                                          child: Text('Continue Setup (Recommended)', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 48,
                                        child: OutlinedButton(
                                          style: OutlinedButton.styleFrom(
                                            side: BorderSide(color: Colors.white.withOpacity(0.12)),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          onPressed: widget.onLoginSuccess,
                                          child: Text('Explore Dashboard', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white60)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],

                              // STEP 4: USERNAME CUSTOMIZATION
                              if (_step == 4) ...[
                                Text(
                                  'Choose Username',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Customize your Tapfolio link prefix',
                                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                                ),
                                const SizedBox(height: 16),
                                _buildGlassTextField(
                                  controller: _usernameController,
                                  label: 'Handle (@username)',
                                  icon: Icons.alternate_email,
                                ),
                                
                                // Username checking indicators
                                if (_isCheckingUsername)
                                  const Padding(
                                    padding: EdgeInsets.only(bottom: 12.0),
                                    child: Text('🔄 Checking availability...', style: TextStyle(color: Colors.white54, fontSize: 12)),
                                  ),
                                if (_isUsernameAvailable && _usernameController.text.trim().isNotEmpty && !_isCheckingUsername)
                                  const Padding(
                                    padding: EdgeInsets.only(bottom: 12.0),
                                    child: Text('✅ Username available!', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                                  ),
                                if (!_isUsernameAvailable && _usernameController.text.trim().isNotEmpty && !_isCheckingUsername)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 12.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('❌ Taken: ${_usernameError ?? "Try another."}', style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                                        if (_usernameSuggestions.isNotEmpty) ...[
                                          const SizedBox(height: 8),
                                          Text('Suggestions:', style: GoogleFonts.outfit(fontSize: 11, color: Colors.white38)),
                                          const SizedBox(height: 4),
                                          Wrap(
                                            spacing: 8,
                                            children: _usernameSuggestions.map((s) => ActionChip(
                                              backgroundColor: Colors.white.withOpacity(0.05),
                                              label: Text(s, style: const TextStyle(color: Colors.indigoAccent, fontSize: 11)),
                                              onPressed: () {
                                                _usernameController.text = s;
                                                setState(() {
                                                  _isUsernameAvailable = true;
                                                });
                                              },
                                            )).toList(),
                                          ),
                                        ],
                                      ],
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
                                    onPressed: _isLoading || !_isUsernameAvailable ? null : _handleStep4Submit,
                                    child: _isLoading
                                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                        : Text('Save Username', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () => setState(() => _step = 5),
                                    child: Text('Skip', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white60)),
                                  ),
                                ),
                              ],

                              // STEP 5: PROFILE DETAILS (Essentials)
                              if (_step == 5) ...[
                                Text(
                                  'Profile Essentials',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Add profile visuals and headlines',
                                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
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
                                  label: 'Headline / Professional tagline',
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
                                      labelText: 'Bio (Optional)',
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
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.indigoAccent,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () {
                                      _saveOnboardingDraft();
                                      setState(() => _step = 6);
                                    },
                                    child: Text('Continue', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],

                              // STEP 6: PRIVACY PREFERENCES
                              if (_step == 6) ...[
                                Text(
                                  'Sharing Preferences',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Choose your default sharing settings',
                                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                                ),
                                const SizedBox(height: 16),
                                SwitchListTile(
                                  title: const Text('Display Name', style: TextStyle(color: Colors.white)),
                                  subtitle: const Text('Required', style: TextStyle(color: Colors.white38, fontSize: 11)),
                                  value: _shareName,
                                  onChanged: null, // Always checked & disabled
                                  activeColor: Colors.indigoAccent,
                                ),
                                SwitchListTile(
                                  title: const Text('Email Address', style: TextStyle(color: Colors.white)),
                                  value: _shareEmail,
                                  onChanged: (val) => setState(() => _shareEmail = val),
                                  activeColor: Colors.indigoAccent,
                                ),
                                SwitchListTile(
                                  title: const Text('Phone Number', style: TextStyle(color: Colors.white)),
                                  value: _sharePhone,
                                  onChanged: (val) => setState(() => _sharePhone = val),
                                  activeColor: Colors.indigoAccent,
                                ),
                                SwitchListTile(
                                  title: const Text('WhatsApp', style: TextStyle(color: Colors.white)),
                                  value: _shareWhatsapp,
                                  onChanged: (val) => setState(() => _shareWhatsapp = val),
                                  activeColor: Colors.indigoAccent,
                                ),
                                SwitchListTile(
                                  title: const Text('Location', style: TextStyle(color: Colors.white)),
                                  value: _shareLocation,
                                  onChanged: (val) => setState(() => _shareLocation = val),
                                  activeColor: Colors.indigoAccent,
                                ),
                                const SizedBox(height: 24),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.indigoAccent,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () {
                                      _saveOnboardingDraft();
                                      setState(() => _step = 7);
                                    },
                                    child: Text('Continue', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],

                              // STEP 7: SOCIAL LINKS
                              if (_step == 7) ...[
                                Text(
                                  'Link Socials (Optional)',
                                  style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Connect your links to build your network',
                                  style: GoogleFonts.outfit(fontSize: 13, color: Colors.white54),
                                ),
                                const SizedBox(height: 16),
                                _buildGlassTextField(
                                  controller: _linkedinController,
                                  label: 'LinkedIn Handle',
                                  icon: Icons.link,
                                ),
                                _buildGlassTextField(
                                  controller: _githubController,
                                  label: 'GitHub Username',
                                  icon: Icons.code,
                                ),
                                _buildGlassTextField(
                                  controller: _instagramController,
                                  label: 'Instagram Handle',
                                  icon: Icons.photo_camera,
                                ),
                                _buildGlassTextField(
                                  controller: _portfolioController,
                                  label: 'Portfolio Website',
                                  icon: Icons.public,
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
                                    onPressed: _isLoading ? null : () => _handleFinalSubmit(skip: false),
                                    child: _isLoading
                                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                        : Text('Save & Continue', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      side: BorderSide(color: Colors.white.withOpacity(0.12)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: _isLoading ? null : () => _handleFinalSubmit(skip: true),
                                    child: Text('Skip For Now', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white60)),
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
