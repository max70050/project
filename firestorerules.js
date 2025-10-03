rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /orders/{orderId} {
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;

      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCoAdmin == true ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      
      allow update: if request.auth != null && (
        (
          resource.data.userId == request.auth.uid &&
          request.resource.data.userAcknowledged == true &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['userAcknowledged'])
        ) || 
        (
          (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCoAdmin == true ||
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true) &&
          request.resource.data.adminCompleted == true &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['adminCompleted'])
        )
      );

      allow delete: if request.auth != null && (
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isCoAdmin == true ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true) &&
        resource.data.userAcknowledged == true &&
        resource.data.adminCompleted == true
      );
    }
  }
}