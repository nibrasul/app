import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/profile.dart';
import 'client_stub.dart'
    if (dart.library.html) 'client_web.dart' as platform_client;

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final http.Client _client = platform_client.getClient();
  String? _jwtToken;

  static const bool isProduction = true;

  String get baseUrl {
    if (isProduction) {
      return 'https://tapfolio.me';
    }

    if (kIsWeb) {
      return 'http://localhost:3000';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000';
    }

    return 'http://localhost:3000';
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _jwtToken = prefs.getString('pertap_jwt');
    
    // For Web, if we successfully logged in before, set a dummy session token
    if (kIsWeb && _jwtToken == null) {
      if (prefs.getBool('pertap_logged_in') == true) {
        _jwtToken = 'web_session';
      }
    }
  }

  bool get isAuthenticated => _jwtToken != null;

  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_jwtToken != null && _jwtToken != 'web_session') {
      headers['Cookie'] = 'pertap_jwt=$_jwtToken';
    }
    return headers;
  }

  void _updateCookie(http.Response response) async {
    final rawCookie = response.headers['set-cookie'];
    if (rawCookie != null) {
      // Find the token in 'pertap_jwt=xxxxx;'
      final regex = RegExp(r'pertap_jwt=([^;]+)');
      final match = regex.firstMatch(rawCookie);
      if (match != null) {
        final token = match.group(1);
        if (token != null) {
          _jwtToken = token;
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('pertap_jwt', token);
        }
      }
    }
  }

  // Cross-platform helper to send requests with credentials (cookies) enabled
  Future<http.Response> _sendRequest(
    String method,
    Uri url, {
    bool authenticated = true,
    Map<String, String>? headers,
    Object? body,
  }) async {
    final request = http.Request(method, url);

    final finalHeaders = authenticated ? _getHeaders() : <String, String>{};
    if (headers != null) {
      finalHeaders.addAll(headers);
    }
    request.headers.addAll(finalHeaders);

    if (body != null) {
      if (body is String) {
        request.body = body;
      } else if (body is List<int>) {
        request.bodyBytes = body;
      } else if (body is Map<String, String>) {
        request.bodyFields = body;
      }
    }

    final streamedResponse = await _client.send(request);
    return http.Response.fromStream(streamedResponse);
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = Uri.parse('$baseUrl/api/auth/login');
      final response = await _sendRequest(
        'POST',
        url,
        authenticated: false,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        if (kIsWeb) {
          _jwtToken = 'web_session';
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool('pertap_logged_in', true);
        } else {
          _updateCookie(response);
        }
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    try {
      final url = Uri.parse('$baseUrl/api/auth/register');
      final response = await _sendRequest(
        'POST',
        url,
        authenticated: false,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'name': name, 'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201 && data['success'] == true) {
        return {'success': true, 'message': data['message']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Registration failed'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<void> logout() async {
    try {
      final url = Uri.parse('$baseUrl/api/auth/logout');
      await _sendRequest('GET', url);
    } catch (_) {}
    _jwtToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('pertap_jwt');
    await prefs.remove('pertap_logged_in');
  }

  Future<User?> getMe() async {
    try {
      final url = Uri.parse('$baseUrl/api/auth/me');
      final response = await _sendRequest('GET', url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['user'] != null) {
          return User.fromJson(data['user']);
        }
      }
    } catch (e) {
      debugPrint('getMe error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getProfile({int? userId, int? profileId}) async {
    try {
      String query = '';
      if (userId != null) {
        query = '?userId=$userId';
      } else if (profileId != null) {
        query = '?profileId=$profileId';
      }
      final url = Uri.parse('$baseUrl/api/profile$query');
      final response = await _sendRequest('GET', url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final profile = Profile.fromJson(data['profile']);
          final score = data['score'] as int? ?? 0;
          final qualifies = data['qualifiesForLeaderboard'] as bool? ?? false;
          var itemsList = data['items'] as List? ?? [];
          final checklist = itemsList.map((i) => ChecklistItem.fromJson(i)).toList();

          return {
            'profile': profile,
            'score': score,
            'qualifiesForLeaderboard': qualifies,
            'checklist': checklist,
          };
        }
      }
    } catch (e) {
      debugPrint('getProfile error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> updateData) async {
    try {
      final url = Uri.parse('$baseUrl/api/profile');
      final response = await _sendRequest(
        'PUT',
        url,
        body: jsonEncode(updateData),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        final profile = Profile.fromJson(data['profile']);
        final score = data['score'] as int? ?? 0;
        final qualifies = data['qualifiesForLeaderboard'] as bool? ?? false;
        var itemsList = data['items'] as List? ?? [];
        final checklist = itemsList.map((i) => ChecklistItem.fromJson(i)).toList();

        return {
          'success': true,
          'profile': profile,
          'score': score,
          'qualifiesForLeaderboard': qualifies,
          'checklist': checklist,
        };
      } else {
        return {'success': false, 'error': data['error'] ?? 'Update failed'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> uploadAvatar(String base64Image, String mimeType) async {
    try {
      final url = Uri.parse('$baseUrl/api/upload');

      var request = http.MultipartRequest('POST', url);
      request.headers.addAll(_getHeaders());
      
      final bytes = base64Decode(base64Image);
      request.files.add(http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: 'avatar.png',
      ));

      final streamedResponse = await _client.send(request);
      final response = await http.Response.fromStream(streamedResponse);

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'url': data['url']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Upload failed'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> tapProfile(int profileId) async {
    try {
      final url = Uri.parse('$baseUrl/api/profile/tap');
      final response = await _sendRequest(
        'POST',
        url,
        authenticated: false,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'profileId': profileId}),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'profile': Profile.fromJson(data['profile']), 'score': data['score']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Tap failed'};
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<List<HistoryEvent>> getHistory() async {
    try {
      final url = Uri.parse('$baseUrl/api/history');
      final response = await _sendRequest('GET', url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['events'] != null) {
          var eventsList = data['events'] as List;
          return eventsList.map((e) => HistoryEvent.fromJson(e)).toList();
        }
      }
    } catch (e) {
      debugPrint('getHistory error: $e');
    }
    return [];
  }

  Future<List<Profile>> getLeaderboard() async {
    try {
      final url = Uri.parse('$baseUrl/api/leaderboard');
      final response = await _sendRequest('GET', url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && data['leaderboard'] != null) {
          var leaderboardList = data['leaderboard'] as List;
          return leaderboardList.map((p) => Profile.fromJson(p)).toList();
        }
      }
    } catch (e) {
      debugPrint('getLeaderboard error: $e');
    }
    return [];
  }
}
