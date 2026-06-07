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
  final String username;
  final String tagline;
  final String avatar;
  final bool isOnline;
  final String bio;
  final String? phone;
  final String? whatsapp;
  final String? location;
  final String diamonds;
  final bool isPremium;
  final int tapCount;
  final List<Tag> tags;
  final List<SocialLink> socials;

  Profile({
    required this.id,
    required this.userId,
    required this.name,
    required this.username,
    required this.tagline,
    required this.avatar,
    required this.isOnline,
    required this.bio,
    this.phone,
    this.whatsapp,
    this.location,
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
      username: json['username'] ?? '',
      tagline: json['tagline'] ?? '',
      avatar: json['avatar'] ?? '',
      isOnline: json['isOnline'] ?? false,
      bio: json['bio'] ?? '',
      phone: json['phone'],
      whatsapp: json['whatsapp'],
      location: json['location'],
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
      'username': username,
      'tagline': tagline,
      'avatar': avatar,
      'isOnline': isOnline,
      'bio': bio,
      'phone': phone,
      'whatsapp': whatsapp,
      'location': location,
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

class ConnectionPermissionData {
  final bool shareName;
  final bool shareEmail;
  final bool sharePhone;
  final bool shareWhatsapp;
  final bool shareLocation;
  final List<int> sharedSocialIds;

  ConnectionPermissionData({
    this.shareName = true,
    this.shareEmail = true,
    this.sharePhone = false,
    this.shareWhatsapp = true,
    this.shareLocation = false,
    this.sharedSocialIds = const [],
  });

  factory ConnectionPermissionData.fromJson(Map<String, dynamic> json) {
    var socialIdsList = json['sharedSocialIds'] as List? ?? [];
    return ConnectionPermissionData(
      shareName: json['shareName'] ?? true,
      shareEmail: json['shareEmail'] ?? true,
      sharePhone: json['sharePhone'] ?? false,
      shareWhatsapp: json['shareWhatsapp'] ?? true,
      shareLocation: json['shareLocation'] ?? false,
      sharedSocialIds: socialIdsList.map((id) => id as int).toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'shareName': shareName,
        'shareEmail': shareEmail,
        'sharePhone': sharePhone,
        'shareWhatsapp': shareWhatsapp,
        'shareLocation': shareLocation,
        'sharedSocialIds': sharedSocialIds,
      };
}

class ConnectionOther {
  final int userId;
  final String? name;
  final String avatar;
  final String tagline;
  final String? email;
  final String? phone;
  final String? whatsapp;
  final String? location;
  final int? profileId;
  final List<Tag> tags;
  final List<SocialLink> socials;

  ConnectionOther({
    required this.userId,
    this.name,
    required this.avatar,
    required this.tagline,
    this.email,
    this.phone,
    this.whatsapp,
    this.location,
    this.profileId,
    required this.tags,
    required this.socials,
  });

  factory ConnectionOther.fromJson(Map<String, dynamic> json) {
    var tagsList = json['tags'] as List? ?? [];
    var socialsList = json['socials'] as List? ?? [];
    return ConnectionOther(
      userId: json['userId'],
      name: json['name'],
      avatar: json['avatar'] ?? '/profile_avatar.png',
      tagline: json['tagline'] ?? '',
      email: json['email'],
      phone: json['phone'],
      whatsapp: json['whatsapp'],
      location: json['location'],
      profileId: json['profileId'],
      tags: tagsList.map((t) => Tag.fromJson(t)).toList(),
      socials: socialsList.map((s) => SocialLink.fromJson(s)).toList(),
    );
  }
}

class Connection {
  final int id;
  final String via;
  final DateTime connectedAt;
  final ConnectionOther other;
  final ConnectionPermissionData? permissions;
  final ConnectionPermissionData? myPermissions;

  Connection({
    required this.id,
    required this.via,
    required this.connectedAt,
    required this.other,
    this.permissions,
    this.myPermissions,
  });

  factory Connection.fromJson(Map<String, dynamic> json) {
    return Connection(
      id: json['id'],
      via: json['via'] ?? 'link',
      connectedAt: DateTime.tryParse(json['connectedAt'] ?? '') ?? DateTime.now(),
      other: ConnectionOther.fromJson(json['other']),
      permissions: json['permissions'] != null
          ? ConnectionPermissionData.fromJson(json['permissions'])
          : null,
      myPermissions: json['myPermissions'] != null
          ? ConnectionPermissionData.fromJson(json['myPermissions'])
          : null,
    );
  }
}

class PendingRequest {
  final int id;
  final String via;
  final DateTime createdAt;
  final int requesterUserId;
  final String requesterName;
  final String requesterAvatar;
  final String requesterTagline;
  final int? requesterProfileId;
  final String requesterDiamonds;
  final int requesterConnectionCount;
  final int requesterTapCount;
  final List<Tag> requesterTags;

  PendingRequest({
    required this.id,
    required this.via,
    required this.createdAt,
    required this.requesterUserId,
    required this.requesterName,
    required this.requesterAvatar,
    required this.requesterTagline,
    this.requesterProfileId,
    required this.requesterDiamonds,
    required this.requesterConnectionCount,
    required this.requesterTapCount,
    required this.requesterTags,
  });

  factory PendingRequest.fromJson(Map<String, dynamic> json) {
    final r = json['requester'] as Map<String, dynamic>;
    var tagsList = r['tags'] as List? ?? [];
    return PendingRequest(
      id: json['id'],
      via: json['via'] ?? 'link',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      requesterUserId: r['userId'],
      requesterName: r['name'] ?? '',
      requesterAvatar: r['avatar'] ?? '/profile_avatar.png',
      requesterTagline: r['tagline'] ?? '',
      requesterProfileId: r['profileId'],
      requesterDiamonds: r['diamonds'] ?? '0',
      requesterConnectionCount: r['connectionCount'] ?? 0,
      requesterTapCount: r['tapCount'] ?? 0,
      requesterTags: tagsList.map((t) => Tag.fromJson(t)).toList(),
    );
  }
}
