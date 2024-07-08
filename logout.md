Signing out a user from Firebase is straightforward and can be accomplished with a single function call. Here's how you can do it:

### JavaScript (Web)

To sign out a user in a web application using the Firebase SDK, you can use the `signOut` method from the Firebase Authentication library. Here’s an example:

1. **Initialize Firebase and Authentication**: Make sure you have already initialized Firebase in your project as shown earlier.

2. **Add a Sign-Out Function**: Implement a sign-out function that you can call when the user clicks a "Sign Out" button.

#### Example:

```javascript
import { getAuth, signOut } from "firebase/auth";

// Initialize Firebase and get the auth instance
const auth = getAuth();

// Function to sign out the user
function signOutUser() {
  signOut(auth)
    .then(() => {
      console.log('User signed out successfully.');
      // Redirect to login page or show a signed-out message
      window.location.href = 'login.html'; // Example redirect
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
}

// Call the function when the user clicks the sign-out button
document.getElementById('signOutButton').addEventListener('click', signOutUser);
```

#### HTML:

```html
<button id="signOutButton">Sign Out</button>
```

### Android

To sign out a user in an Android application using the Firebase SDK:

1. **Initialize Firebase and Authentication**: Make sure you have already initialized Firebase in your project.

2. **Add a Sign-Out Function**: Implement a sign-out function that you can call when the user clicks a "Sign Out" button.

#### Example:

```java
import com.google.firebase.auth.FirebaseAuth;

// Get the instance of FirebaseAuth
FirebaseAuth auth = FirebaseAuth.getInstance();

// Function to sign out the user
public void signOutUser() {
    auth.signOut();
    // Redirect to login activity or show a signed-out message
    Intent intent = new Intent(this, LoginActivity.class);
    startActivity(intent);
    finish(); // Optional: call finish() to close the current activity
}

// Call the function when the user clicks the sign-out button
Button signOutButton = findViewById(R.id.signOutButton);
signOutButton.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        signOutUser();
    }
});
```

#### XML Layout:

```xml
<Button
    android:id="@+id/signOutButton"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Sign Out" />
```

### iOS (Swift)

To sign out a user in an iOS application using the Firebase SDK:

1. **Initialize Firebase and Authentication**: Make sure you have already initialized Firebase in your project.

2. **Add a Sign-Out Function**: Implement a sign-out function that you can call when the user clicks a "Sign Out" button.

#### Example:

```swift
import FirebaseAuth

// Function to sign out the user
func signOutUser() {
    let firebaseAuth = Auth.auth()
    do {
        try firebaseAuth.signOut()
        print("User signed out successfully.")
        // Redirect to login view controller or show a signed-out message
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let loginVC = storyboard.instantiateViewController(withIdentifier: "LoginViewController")
        self.present(loginVC, animated: true, completion: nil)
    } catch let signOutError as NSError {
        print("Error signing out: %@", signOutError)
    }
}

// Call the function when the user clicks the sign-out button
@IBAction func signOutButtonTapped(_ sender: UIButton) {
    signOutUser()
}
```

#### Interface Builder:

- Add a button to your view controller and connect its action to the `signOutButtonTapped` method.

By following these steps, you can implement a sign-out function in your Firebase-enabled application on different platforms. This ensures that users can securely sign out of their accounts.