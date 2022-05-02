const admin = require("firebase-admin")
const serviceAccount = require("./../../config/serviceAccountKey.json")

const db = admin.firestore();

module.exports = {
  createUser: async (id, email) => {
    const docRef = db.collection('users').doc(id)
    await docRef.set({
      email: email,
    })
  },

  getWines: async (user_id) => {
    const snapshot = await db.collection('users').doc(user_id).collection('wines').get()
    return snapshot.docs
  },

  getWine: async (user_id, wine_id) => {
    const wine = await db.collection('users').doc(user_id).collection('wines').doc(wine_id).get()
    return wine.data()
  },

  addWine: async (user_id, wine_data) => {
    await db.collection('users').doc(user_id)
      .collection('wines').add(wine_data)
  },

  editWine: async (user_id, wine_id, wine_data) => {
    await db.collection('users').doc(user_id)
      .collection('wines').doc(wine_id).set(wine_data)
  },
}