import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { getFirebaseDb } from "@/components/auth-provider"
import type { User } from "firebase/auth"

export async function createOrUpdateUserProfile(user: User) {
  const db = getFirebaseDb()
  const ref = doc(db, "users", user.uid)
  const snap = await getDoc(ref)

  const data = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
  }

  if (snap.exists()) {
    await updateDoc(ref, data)
  } else {
    await setDoc(ref, {
      ...data,
      createdAt: new Date().toISOString(),
    })
  }
}

export async function updateUserProfile(uid: string, data: { displayName?: string; photoURL?: string }) {
  const db = getFirebaseDb()
  const ref = doc(db, "users", uid)
  await updateDoc(ref, data)
}
