# Things to do:
[ ] Set up a script that runs a periodic check of https://api.coindesk.com/v1/bpi/currentprice.json
[ ] Hook the script up to something that checks for triggers and fires off events when certain triggers are hit
[ ] Create CRUD API for the event triggers (e.g. a record to tell it to watch for when the BTC:USD price is < $8,000, and what event to fire when that happens)
[x] Create CRUD API for the events themselves (e.g. what happens when an event trigger is hit)
[ ] Create UI for managing this stuff
