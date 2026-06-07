import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../models/profile.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _apiService = ApiService();
  final ImagePicker _picker = ImagePicker();

  Profile? _profile;
  int _score = 0;
  bool _qualifies = false;
  List<ChecklistItem> _checklist = [];
  bool _loading = true;
  bool _saving = false;

  // Controllers
  final _nameController = TextEditingController();
  final _taglineController = TextEditingController();
  final _bioController = TextEditingController();

  // Tags states
  final _tagController = TextEditingController();
  String _tagType = 'role';

  // Socials states
  String _socialPlatform = 'GitHub';
  final _socialHandleController = TextEditingController();
  final _socialUrlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _taglineController.dispose();
    _bioController.dispose();
    _tagController.dispose();
    _socialHandleController.dispose();
    _socialUrlController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    setState(() {
      _loading = true;
    });

    final res = await _apiService.getProfile();
    if (res != null) {
      setState(() {
        _profile = res['profile'];
        _score = res['score'];
        _qualifies = res['qualifiesForLeaderboard'];
        _checklist = res['checklist'];

        _nameController.text = _profile!.name;
        _taglineController.text = _profile!.tagline;
        _bioController.text = _profile!.bio;
      });
    }

    setState(() {
      _loading = false;
    });
  }

  Future<void> _pickAndUploadImage() async {
    try {
      final XFile? image = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 500);
      if (image == null) return;

      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);
      final mimeType = image.mimeType ?? 'image/png';

      setState(() {
        _saving = true;
      });

      final result = await _apiService.uploadAvatar(base64Image, mimeType);
      if (result['success'] == true) {
        // Automatically save new avatar
        final saveRes = await _apiService.updateProfile({'avatar': result['url']});
        if (saveRes['success'] == true) {
          setState(() {
            _profile = saveRes['profile'];
            _score = saveRes['score'];
            _qualifies = saveRes['qualifiesForLeaderboard'];
            _checklist = saveRes['checklist'];
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Avatar uploaded successfully!'), backgroundColor: Color(0xFF10B981)),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['error'] ?? 'Upload failed'), backgroundColor: Colors.redAccent),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking image: $e'), backgroundColor: Colors.redAccent),
      );
    } finally {
      setState(() {
        _saving = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({
      'name': _nameController.text.trim(),
      'tagline': _taglineController.text.trim(),
      'bio': _bioController.text.trim(),
    });

    setState(() {
      _saving = false;
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile saved!'), backgroundColor: Color(0xFF10B981)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'] ?? 'Save failed'), backgroundColor: Colors.redAccent),
      );
    }
  }

  Future<void> _addTag() async {
    final text = _tagController.text.trim();
    if (text.isEmpty || _profile == null) return;

    final updatedTags = List<Tag>.from(_profile!.tags);
    if (updatedTags.any((t) => t.text.toLowerCase() == text.toLowerCase() && t.type == _tagType)) {
      return;
    }

    updatedTags.add(Tag(text: text, type: _tagType));

    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({
      'tags': updatedTags.map((t) => t.toJson()).toList(),
    });

    setState(() {
      _saving = false;
      _tagController.clear();
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
    }
  }

  Future<void> _removeTag(int index) async {
    if (_profile == null) return;
    final updatedTags = List<Tag>.from(_profile!.tags)..removeAt(index);

    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({
      'tags': updatedTags.map((t) => t.toJson()).toList(),
    });

    setState(() {
      _saving = false;
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
    }
  }

  Future<void> _addSocial() async {
    final handle = _socialHandleController.text.trim();
    var url = _socialUrlController.text.trim();
    if (handle.isEmpty || url.isEmpty || _profile == null) return;

    if (!url.startsWith('http')) {
      url = 'https://$url';
    }

    final platformSpecs = {
      'GitHub': {'color': '#24292e', 'icon': 'github'},
      'LinkedIn': {'color': '#0077b5', 'icon': 'linkedin'},
      'Twitter': {'color': '#1da1f2', 'icon': 'twitter'},
      'Instagram': {'color': '#e1306c', 'icon': 'instagram'},
      'YouTube': {'color': '#ff0000', 'icon': 'youtube'},
      'Website': {'color': '#10b981', 'icon': 'globe'},
    };

    final specs = platformSpecs[_socialPlatform] ?? {'color': '#6366f1', 'icon': 'link'};

    final updatedSocials = List<SocialLink>.from(_profile!.socials);
    updatedSocials.add(SocialLink(
      platform: _socialPlatform,
      handle: handle,
      url: url,
      icon: specs['icon']!,
      color: specs['color']!,
    ));

    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({
      'socials': updatedSocials.map((s) => s.toJson()).toList(),
    });

    setState(() {
      _saving = false;
      _socialHandleController.clear();
      _socialUrlController.clear();
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
    }
  }

  Future<void> _removeSocial(int index) async {
    if (_profile == null) return;
    final updatedSocials = List<SocialLink>.from(_profile!.socials)..removeAt(index);

    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({
      'socials': updatedSocials.map((s) => s.toJson()).toList(),
    });

    setState(() {
      _saving = false;
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
    }
  }

  Future<void> _upgradeToPremium() async {
    setState(() {
      _saving = true;
    });

    final result = await _apiService.updateProfile({'isPremium': true});

    setState(() {
      _saving = false;
    });

    if (result['success'] == true) {
      setState(() {
        _profile = result['profile'];
        _score = result['score'];
        _qualifies = result['qualifiesForLeaderboard'];
        _checklist = result['checklist'];
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Upgraded to Premium successfully!'), backgroundColor: Colors.amber),
      );
    }
  }

  void _showCheckoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          bool processing = false;
          return AlertDialog(
            backgroundColor: const Color(0xFF141420),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: Colors.white.withOpacity(0.1)),
            ),
            title: Text(
              'Tapfolio Checkout',
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Upgrade profile to Premium membership.',
                  style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 20),
                Text(
                  'Card Number',
                  style: GoogleFonts.outfit(color: Colors.white60, fontSize: 12),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.credit_card, color: Colors.white54),
                      const SizedBox(width: 12),
                      Text(
                        '4242 •••• •••• 4242',
                        style: GoogleFonts.outfit(color: Colors.white),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Expires',
                            style: GoogleFonts.outfit(color: Colors.white60, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Text('12/28', style: GoogleFonts.outfit(color: Colors.white)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CVC',
                            style: GoogleFonts.outfit(color: Colors.white60, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Text('***', style: GoogleFonts.outfit(color: Colors.white)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: processing ? null : () => Navigator.pop(context),
                child: Text('Cancel', style: GoogleFonts.outfit(color: Colors.white54)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.amber,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: processing
                    ? null
                    : () async {
                        setModalState(() {
                          processing = true;
                        });
                        Navigator.pop(context);
                        await _upgradeToPremium();
                      },
                child: Text(
                  'Pay \$9.99',
                  style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildGlassCard({required List<Widget> children, CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.start}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: crossAxisAlignment,
        children: children,
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: GoogleFonts.outfit(color: Colors.white),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: Colors.indigoAccent));
    }

    if (_profile == null) {
      return Center(
        child: Text(
          'Error loading profile card.',
          style: GoogleFonts.outfit(color: Colors.white70),
        ),
      );
    }

    final publicLink = '${_apiService.baseUrl}/${_profile!.userId}';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Public NFC Link Card
          _buildGlassCard(
            children: [
              Text(
                'Share NFC Card',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                'Link programmed to your physical tag.',
                style: GoogleFonts.outfit(color: Colors.white60, fontSize: 13),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: Text(
                        publicLink,
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigoAccent,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: publicLink));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Link copied to clipboard!')),
                      );
                    },
                    child: Text('Copy', style: GoogleFonts.outfit(color: Colors.white)),
                  ),
                ],
              ),
            ],
          ),

          // Score / Checklist Card
          _buildGlassCard(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Profile Score',
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.indigoAccent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$_score / 100',
                      style: GoogleFonts.outfit(color: Colors.indigoAccent, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: _score / 100,
                  backgroundColor: Colors.white.withOpacity(0.1),
                  color: Colors.indigoAccent,
                  minHeight: 12,
                ),
              ),
              const SizedBox(height: 16),
              ..._checklist.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        item.completed ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: item.completed ? const Color(0xFF10B981) : Colors.white38,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  item.label,
                                  style: GoogleFonts.outfit(
                                    color: item.completed ? Colors.white : Colors.white60,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '+${item.points} pts',
                                  style: GoogleFonts.outfit(color: Colors.indigoAccent, fontSize: 11),
                                ),
                              ],
                            ),
                            Text(
                              item.description,
                              style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ],
          ),

          // Premium Subscription Card
          _buildGlassCard(
            children: [
              _profile!.isPremium
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '💎 PREMIUM MEMBER',
                            style: GoogleFonts.outfit(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Your profile subscription is active! Reach 60 pts to join the public rankings.',
                          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Tapfolio Premium',
                          style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Upgrade to premium to display your profile in the global leaderboard.',
                          style: GoogleFonts.outfit(color: Colors.white60, fontSize: 13),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.amber,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: _saving ? null : _showCheckoutDialog,
                            child: Text(
                              'Upgrade for \$9.99',
                              style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
            ],
          ),

          // Edit Profile Details Card
          _buildGlassCard(
            children: [
              Text(
                'Edit Profile details',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              // Avatar
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.white10,
                      backgroundImage: _profile!.avatar.startsWith('data:')
                          ? MemoryImage(base64Decode(_profile!.avatar.split(',')[1]))
                          : NetworkImage('${_apiService.baseUrl}${_profile!.avatar}') as ImageProvider,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _saving ? null : _pickAndUploadImage,
                        child: CircleAvatar(
                          radius: 18,
                          backgroundColor: Colors.indigoAccent,
                          child: _saving
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.camera_alt, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              _buildTextField(_nameController, 'Full Name'),
              _buildTextField(_taglineController, 'Card Tagline'),
              _buildTextField(_bioController, 'Professional Bio', maxLines: 4),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigoAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _saving ? null : _saveProfile,
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white),
                        )
                      : Text('Save Profile Card', style: GoogleFonts.outfit(color: Colors.white)),
                ),
              ),
            ],
          ),

          // Tags Card
          _buildGlassCard(
            children: [
              Text(
                'Skills & Location Tags',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: TextField(
                        controller: _tagController,
                        style: GoogleFonts.outfit(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Tag name',
                          hintStyle: TextStyle(color: Colors.white24),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        dropdownColor: const Color(0xFF141420),
                        value: _tagType,
                        style: GoogleFonts.outfit(color: Colors.white),
                        onChanged: (String? newVal) {
                          if (newVal != null) {
                            setState(() {
                              _tagType = newVal;
                            });
                          }
                        },
                        items: const [
                          DropdownMenuItem(value: 'role', child: Text('Role/Skill')),
                          DropdownMenuItem(value: 'location', child: Text('Location')),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.add_circle, color: Colors.indigoAccent, size: 36),
                    onPressed: _saving ? null : _addTag,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(_profile!.tags.length, (idx) {
                  final tag = _profile!.tags[idx];
                  final isRole = tag.type == 'role';
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isRole ? Colors.indigoAccent.withOpacity(0.1) : Colors.teal.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isRole ? Colors.indigoAccent.withOpacity(0.3) : Colors.teal.withOpacity(0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          tag.text,
                          style: GoogleFonts.outfit(color: isRole ? Colors.indigoAccent : Colors.tealAccent, fontSize: 13),
                        ),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: _saving ? null : () => _removeTag(idx),
                          child: const Icon(Icons.close, size: 14, color: Colors.white54),
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ],
          ),

          // Socials Card
          _buildGlassCard(
            children: [
              Text(
                'Social Profiles',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.04),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        dropdownColor: const Color(0xFF141420),
                        value: _socialPlatform,
                        style: GoogleFonts.outfit(color: Colors.white),
                        onChanged: (String? newVal) {
                          if (newVal != null) {
                            setState(() {
                              _socialPlatform = newVal;
                            });
                          }
                        },
                        items: const [
                          DropdownMenuItem(value: 'GitHub', child: Text('GitHub')),
                          DropdownMenuItem(value: 'LinkedIn', child: Text('LinkedIn')),
                          DropdownMenuItem(value: 'Twitter', child: Text('Twitter')),
                          DropdownMenuItem(value: 'Instagram', child: Text('Instagram')),
                          DropdownMenuItem(value: 'YouTube', child: Text('YouTube')),
                          DropdownMenuItem(value: 'Website', child: Text('Website')),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: TextField(
                        controller: _socialHandleController,
                        style: GoogleFonts.outfit(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Handle',
                          hintStyle: TextStyle(color: Colors.white24),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                      ),
                      child: TextField(
                        controller: _socialUrlController,
                        style: GoogleFonts.outfit(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'URL (e.g. github.com/username)',
                          hintStyle: TextStyle(color: Colors.white24),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.add_circle, color: Colors.indigoAccent, size: 36),
                    onPressed: _saving ? null : _addSocial,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...List.generate(_profile!.socials.length, (idx) {
                final link = _profile!.socials[idx];
                final cardColor = Color(int.parse(link.color.replaceFirst('#', '0xFF')));
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.02),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: cardColor.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(color: cardColor, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            '${link.platform}: ',
                            style: GoogleFonts.outfit(color: Colors.white70, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            link.handle,
                            style: GoogleFonts.outfit(color: Colors.white),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: _saving ? null : () => _removeSocial(idx),
                        child: const Icon(Icons.delete, color: Colors.redAccent, size: 18),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ],
      ),
    );
  }
}
