class User {
  final int id;
  final String name;
  final String email;
  final Profile? profile;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.profile,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      profile: json['profile'] != null ? Profile.fromJson(json['profile']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profile': profile?.toJson(),
    };
  }
}

class Profile {
  final int id;
  final int userId;
  final String name;
  final String tagline;
  final String avatar;
  final bool isOnline;
  final String bio;
  final String diamonds;
  final bool isPremium;
  final int tapCount;
  final List<Tag> tags;
  final List<SocialLink> socials;

  Profile({
    required this.id,
    required this.userId,
    required this.name,
    required this.tagline,
    required this.avatar,
    required this.isOnline,
    required this.bio,
    required this.diamonds,
    required this.isPremium,
    required this.tapCount,
    required this.tags,
    required this.socials,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    var tagsList = json['tags'] as List? ?? [];
    var socialsList = json['socials'] as List? ?? [];

    return Profile(
      id: json['id'],
      userId: json['userId'],
      name: json['name'] ?? '',
      tagline: json['tagline'] ?? '',
      avatar: json['avatar'] ?? '',
      isOnline: json['isOnline'] ?? false,
      bio: json['bio'] ?? '',
      diamonds: json['diamonds'] ?? '0',
      isPremium: json['isPremium'] ?? false,
      tapCount: json['tapCount'] ?? 0,
      tags: tagsList.map((i) => Tag.fromJson(i)).toList(),
      socials: socialsList.map((i) => SocialLink.fromJson(i)).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'tagline': tagline,
      'avatar': avatar,
      'isOnline': isOnline,
      'bio': bio,
      'diamonds': diamonds,
      'isPremium': isPremium,
      'tapCount': tapCount,
      'tags': tags.map((i) => i.toJson()).toList(),
      'socials': socials.map((i) => i.toJson()).toList(),
    };
  }
}

class Tag {
  final int? id;
  final String text;
  final String type; // "role" | "location"

  Tag({
    this.id,
    required this.text,
    required this.type,
  });

  factory Tag.fromJson(Map<String, dynamic> json) {
    return Tag(
      id: json['id'],
      text: json['text'] ?? '',
      type: json['type'] ?? 'role',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'text': text,
      'type': type,
    };
  }
}

class SocialLink {
  final int? id;
  final String platform;
  final String handle;
  final String url;
  final String icon;
  final String color;

  SocialLink({
    this.id,
    required this.platform,
    required this.handle,
    required this.url,
    required this.icon,
    required this.color,
  });

  factory SocialLink.fromJson(Map<String, dynamic> json) {
    return SocialLink(
      id: json['id'],
      platform: json['platform'] ?? '',
      handle: json['handle'] ?? '',
      url: json['url'] ?? '',
      icon: json['icon'] ?? '',
      color: json['color'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'platform': platform,
      'handle': handle,
      'url': url,
      'icon': icon,
      'color': color,
    };
  }
}

class HistoryEvent {
  final int id;
  final String action;
  final String details;
  final String? icon;
  final String? color;
  final String createdAt;

  HistoryEvent({
    required this.id,
    required this.action,
    required this.details,
    this.icon,
    this.color,
    required this.createdAt,
  });

  factory HistoryEvent.fromJson(Map<String, dynamic> json) {
    return HistoryEvent(
      id: json['id'],
      action: json['action'] ?? '',
      details: json['details'] ?? '',
      icon: json['icon'],
      color: json['color'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}

class ChecklistItem {
  final String id;
  final String label;
  final int points;
  final bool completed;
  final String description;

  ChecklistItem({
    required this.id,
    required this.label,
    required this.points,
    required this.completed,
    required this.description,
  });

  factory ChecklistItem.fromJson(Map<String, dynamic> json) {
    return ChecklistItem(
      id: json['id'] ?? '',
      label: json['label'] ?? '',
      points: json['points'] ?? 0,
      completed: json['completed'] ?? false,
      description: json['description'] ?? '',
    );
  }
}
