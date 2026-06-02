# 🔧 Troubleshooting & FAQ

## Common Issues & Solutions

### 1. "Permission denied" on sign-up
**Error:** `FirebaseError: Missing or insufficient permissions`

**Cause:** Firestore rules not deployed or incorrectly configured

**Solution:**
1. Go to Firebase Console → Firestore Database → Rules
2. Paste the updated rules from `firestore.rules`
3. Click "Publish" button
4. Wait 30 seconds for deployment
5. Refresh your app

---

### 2. "User not found on Device 2"
**Error:** `No active user configuration found or checksum mismatch`

**Cause:** 
- User wasn't actually created in Firestore (rules not deployed)
- Wrong checksum entered
- Case sensitivity issue with email

**Solution:**
1. Check Firestore Console → looplab_users collection
2. Should see document with email as ID (lowercase)
3. Verify checksum matches exactly (copy-paste, don't type)
4. Try signing up again to create a fresh account

---

### 3. "Admin dashboard doesn't show real-time updates"
**Error:** Accounts list doesn't update when new user signs in

**Cause:** Real-time subscriptions not initializing

**Solution:**
1. Check browser console (F12) for errors
2. Verify you're authenticated in admin panel
3. Check that subscriptions are active:
   ```javascript
   // Type in browser console:
   FirestoreAccountService.subscribeToAllUsers(users => {
     console.log('Users updated:', users);
   });
   ```
4. If still no data, check Firestore rules are published

---

### 4. "Firestore quota exceeded"
**Error:** `RESOURCE_EXHAUSTED` or quota messages

**Cause:** Using Firestore free tier with too many operations

**Solution:**
- Free tier: 50,000 reads/day, 20,000 writes/day
- Upgrade to Blaze plan ($0.06 per 100k reads)
- Optimize: Cache data, reduce subscriptions, batch operations

---

### 5. "App crashes on sign-in"
**Error:** Uncaught error, blank screen after clicking authenticate

**Cause:**
- Firestore not initialized properly
- Missing Firebase config
- Invalid email format

**Solution:**
1. Check `.env.local` has all Firebase keys:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
2. Verify Firebase project in console is correct
3. Check browser console for specific error message

---

### 6. "Sessions not being cleared"
**Error:** User stays logged in after admin deletes account

**Cause:** Session deletion failed silently

**Solution:**
1. Check Firestore console for looplab_sessions collection
2. Manually delete old sessions if needed
3. Verify rules allow deletes:
   ```
   allow delete: if true;  // In looplab_sessions section
   ```
4. Try clearing single session first, then all

---

### 7. "Email field won't accept my email"
**Error:** Input validation fails on sign-up form

**Cause:** Email validation too strict or format issue

**Solution:**
- Use standard email format: `user@domain.com`
- No spaces before/after email
- Gmail aliases (+ addresses) may not work: `user+tag@gmail.com`
- Try: `testuser123@example.com`

---

### 8. "Checksum keeps changing"
**Error:** Generated checksum different each time for same email/username

**Cause:** This is NORMAL if using Date.now() in calculation

**Solution:**
- Checksum SHOULD be consistent for same email + username
- If it's changing, check `calculateChecksumValue()` function
- Should be deterministic (same inputs = same output)

---

### 9. "Real-time updates slow or delayed"
**Error:** Takes 5-10 seconds for admin dashboard to update

**Cause:**
- Slow internet connection
- Too many subscriptions active
- Firestore operations queued

**Solution:**
- Check internet connection speed
- Close unnecessary browser tabs
- Reduce number of active subscriptions
- Consider using `getDocs()` instead of real-time if only occasional updates

---

### 10. "Can't delete admin account"
**Error:** Admin can't delete their own account

**Cause:** Can delete but will immediately log out

**Solution:**
- Delete account is allowed (it's admin's choice)
- You'll be logged out automatically
- Create new account to re-access admin panel
- Or create backup admin account first

---

## Advanced Debugging

### Enable Verbose Logging
```typescript
// In FirestoreAccountService.ts
// Uncomment console.log statements
console.log('Firestore operation:', operation);
console.log('Result:', result);
```

### Check Firestore Connection
```javascript
// In browser console
import { db } from './src/lib/firebase.ts';
import { doc, getDoc } from 'firebase/firestore';

getDoc(doc(db, 'looplab_users', 'test@example.com')).then(snap => {
  console.log('Connection OK:', snap.exists());
}).catch(err => {
  console.error('Connection failed:', err);
});
```

### Monitor Real-Time Subscriptions
```javascript
// In browser console
FirestoreAccountService.subscribeToAllUsers(users => {
  console.log(`[SUBSCRIPTION] Users updated: ${users.length} users`);
});

FirestoreAccountService.subscribeToActiveSessions(sessions => {
  console.log(`[SUBSCRIPTION] Sessions updated: ${sessions.length} sessions`);
});
```

### View Firestore Operations
```javascript
// Firebase Console → Firestore → Metrics
// Shows all reads/writes in real-time
```

---

## Performance Optimization

### Reduce Subscription Count
Instead of:
```typescript
subscribeToAllUsers()
subscribeToAllUsers() // Called again!
subscribeToActiveSessions()
```

Use:
```typescript
const unsubUsers = subscribeToAllUsers(callback1)
// Later when done:
unsubUsers() // Cleanup!
```

### Batch Operations
Instead of:
```typescript
for (const user of users) {
  await deleteUser(user.email) // 10 deletes = 10 writes
}
```

Consider bulk operation in future enhancement.

### Cache Locally
```typescript
const [cachedUsers, setCachedUsers] = useState<FirestoreUser[]>([])
const [lastUpdate, setLastUpdate] = useState<number>(0)

// Only refresh if older than 5 minutes
if (Date.now() - lastUpdate > 5 * 60 * 1000) {
  refreshUsers()
}
```

---

## Testing Checklist

- [ ] Sign up with new email (should create user)
- [ ] Sign in with same email + checksum (should authenticate)
- [ ] Sign in from different browser (should work)
- [ ] Sign in from same browser (should work)
- [ ] Admin sees active session in real-time
- [ ] Admin deletes user (user disappears from other devices)
- [ ] Admin clears session (user logged out)
- [ ] Generate new checksum (should be different if using randomization)
- [ ] Refresh page while logged in (should stay logged in from localStorage fallback)
- [ ] Check Firestore metrics (should see read/write operations)

---

## Firebase Console Navigation

### To view your data:
1. Firebase Console → Select Project → Firestore Database
2. Collections tab shows all data
3. `looplab_users` → see all registered users
4. `looplab_sessions` → see active login sessions

### To view metrics:
1. Firebase Console → Select Project → Firestore Database
2. Metrics tab shows usage
3. Operations tab shows recent operations

### To update rules:
1. Firebase Console → Select Project → Firestore Database
2. Rules tab → edit directly → publish

### To set up backups:
1. Firebase Console → Select Project → Firestore Database
2. Backups → Schedule daily backups (recommended for production)

---

## When to Contact Support

Create an issue if:
- [ ] Following all steps but still getting errors
- [ ] Error messages not matching any listed above
- [ ] Firestore metrics showing errors
- [ ] Need to restore from backup
- [ ] Performance issues with large user base (>1000 users)

---

## Summary

**Most common fixes:**
1. Publish firestore.rules
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check `.env.local` has all credentials
4. Restart app (npm run dev)
5. Check Firebase Console for actual data

**If still stuck:**
1. Check browser console (F12) for error details
2. Share exact error message
3. Share which step fails
4. Describe what you expect vs what happens

You've got this! The system is well-tested and should work smoothly. 🚀
