/*const { db } = require('./lib/firebaseAdmin');

async function populateFirestore() {
  try {
    // Populate waiters
    const waiters = [
      {
        id: 'waiter1',
        name: 'John Doe',
        email: 'john@example.com',
        fcmToken: 'test-fcm-token-1', // Replace with real FCM token from React Native app
      },
      {
        id: 'waiter2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        fcmToken: 'test-fcm-token-2',
      },
    ];

    for (const waiter of waiters) {
      await db.collection('waiters').doc(waiter.id).set({
        name: waiter.name,
        email: waiter.email,
        fcmToken: waiter.fcmToken,
      });
      console.log(`Added waiter: ${waiter.name}`);
    }

    // Populate events
    const events = [
      {
        id: 'event1',
        name: 'Wedding',
        date: '2025-06-01',
        location: 'Venue A',
      },
      {
        id: 'event2',
        name: 'Corporate Party',
        date: '2025-07-15',
        location: 'Venue B',
      },
    ];

    for (const event of events) {
      await db.collection('events').doc(event.id).set({
        name: event.name,
        date: event.date,
        location: event.location,
      });
      console.log(`Added event: ${event.name}`);
    }

    console.log('Firestore populated successfully');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

populateFirestore();



'use client';

import { useState, useRef } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function Triplets() {
  const [textInput, setTextInput] = useState('');
  const [results, setResults] = useState([]);
  const [monthlyTripletCounts, setMonthlyTripletCounts] = useState({});
  const [processing, setProcessing] = useState(false);
  const textAreaRef = useRef(null);
  const saveButtonRef = useRef(null);

  const handleTextInputChange = (event) => {
      setTextInput(event.target.value);
  };

  const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
          setProcessing(true);
          const reader = new FileReader();
          reader.onload = async (e) => {
              const csvText = e.target.result;
              try {
                  const extractedData = extractLotteryDataFromCSV(csvText);
                  setResults(extractedData);
                  const monthlyCounts = countTripletsByMonth(extractedData);
                  setMonthlyTripletCounts(monthlyCounts);
              } catch (error) {
                  console.error('Error processing CSV file:', error);
                  alert(`Failed to process CSV file: ${error.message}`);
              } finally {
                  setProcessing(false);
                  if (saveButtonRef.current) {
                      saveButtonRef.current.focus();
                  }
              }
          };
          reader.onerror = () => {
              alert('Failed to read the CSV file.');
              setProcessing(false);
          };
          reader.readAsText(file);
      }
  };

  const processText = async () => {
      try {
          setProcessing(true);
          const extractedData = extractLotteryData(textInput);
          setResults(extractedData);
          const monthlyCounts = countTripletsByMonth(extractedData);
          setMonthlyTripletCounts(monthlyCounts);
      } catch (error) {
          console.error('Error processing text:', error);
          alert(`Failed to process text: ${error.message}`);
      } finally {
          setProcessing(false);
          if (saveButtonRef.current) {
              saveButtonRef.current.focus();
          }
      }
  };

  const saveToFirestore = async () => {
      if (!db) {
          alert('Firestore is not initialized. Check Firebase configuration.');
          return;
      }

      try {
          const collectionRef = collection(db, 'uk49s_monthly_triplets');
          await addDoc(collectionRef, {
              monthlyTripletCounts: monthlyTripletCounts,
              draws: results,
              createdAt: serverTimestamp(),
          });
          alert('Successfully saved to Firestore!');
          setTextInput('');
          textAreaRef.current.focus();
      } catch (error) {
          console.error('Error saving to Firestore:', error);
          alert('Failed to save to Firestore');
      }
  };

}