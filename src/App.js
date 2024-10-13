import React, { useState } from 'react';
import './App.css';

// Function to get today's date in ISO format
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0] + 'T23:59:59Z';
};

// Function to get the date 30 days from now in ISO format
const getNext30Days = () => {
  const next30Days = new Date();
  next30Days.setDate(next30Days.getDate() + 30); // Add 30 days
  return next30Days.toISOString().split('T')[0] + 'T23:59:59Z';
};

// Using environment variables for the API key
const API_KEY = process.env.REACT_APP_TICKETMASTER_API_KEY;
let pageNum = 0;
const API_URL = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&city=Seattle&startDateTime=${getToday()}&sort=date,asc&endDateTime=${getNext30Days()}&size=200`;


function App() {
  const [events, setEvents] = useState([]); // Store the events
  const [showEvents, setShowEvents] = useState(false);

  // Recursive function to fetch events from the API and handle multiple pages
  const fetchEvents = async () => {
    const url = `${API_URL}&page=${pageNum}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      if (data._embedded && data._embedded.events) {
        // Add the new events to the current list of events
        setEvents(prevEvents => [
          ...prevEvents,
          ...data._embedded.events
        ]);
      }
      
      if (pageNum < data.page.totalPages - 1) {
        pageNum++;
        fetchEvents();
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Function to send events to the backend
  const saveEventsToFile = async (events) => {
    try {
      const response = await fetch('http://localhost:2000/save-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(events)
      });

      if (!response.ok) {
        throw new Error(`Failed to save events: ${response.statusText}`);
      }

      //const result = await response.text();
      
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  const readFile = async() => {
    const date = new Date();
    if (date.getDate() === 1) {
      fetchEvents();
      saveEventsToFile(events);
    }
    try {
    const response = await fetch('http://localhost:2000/get-events');
    if (!response.ok) {
      throw new Error(`failure fetching events: ${response.statusText}`);
    }
    const result = await response.json();
    setEvents(prevEvents => [
      ...prevEvents,
      ...result
    ]);
    setShowEvents(true);
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  };

  return (
    <div className="App">
      <header class="topHeader"><h1>Event Finder</h1></header>
      <div className="box">
        <div className="header">
          Events
        </div>
        {!showEvents && (
          <button className="button" onClick={readFile}>
            See events in your area
          </button>
        )}
        {showEvents && (
          <div className="events">
            <ul>
              {events.slice(0, 20).map(event => ( // Limit to 20 events
                <li key={event.id}>
                  <a href={event.url} target='_blank' rel='noopener noreferrer'>
                    {event.name} - {event.dates.start.localDate}
                  </a>
                </li>
              ))}
            </ul>
            <button class="moreButton">Show More</button>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
