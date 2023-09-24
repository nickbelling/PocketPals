#!python

# Copyright (C) 2022, Nick Belling.
# Feel free to copy and modify this code as you see fit.

# Usage:
# python fire_browser_event.py [eventName] [obsWebsocketURL] [obsWebsocketPassword]

# Connects to an OBS Websocket and asks it to fire a JavaScript window event in
# any loaded browser source with the given event name.

# Can also be modified to pass a data object to the event, but currently this
# doesn't do that.

import sys
import logging
logging.basicConfig(level=logging.DEBUG)
import asyncio
import simpleobsws

if len(sys.argv) > 3:
    # Get the event name we want OBS to fire in the browser source
    eventName = sys.argv[1]

    # Get the OBS websocket connection details
    websocket_url = sys.argv[2]
    websocket_password = sys.argv[3]

    # Create the websocket client
    websocket = simpleobsws.WebSocketClient(
        url = websocket_url,
        password = websocket_password)

    async def make_request():
        # Make the connection to obs-websocket
        await websocket.connect()

        # Wait for the identification handshake to complete
        await websocket.wait_until_identified()

        # Build a Request object
        request = simpleobsws.Request('CallVendorRequest')
        request.requestData = {
            "vendorName": "obs-browser",
            "requestType": "emit_event",
            "requestData": {
                "event_name": eventName,
                # Adapt this object to pass data if your event needs it.
                "event_data": {}
            }
        }

        ret = await websocket.call(request) # Perform the request
        if ret.ok(): # Check if the request succeeded
            print("Request succeeded! Response data: {}".format(ret.responseData))

        await websocket.disconnect() # Disconnect from the websocket server cleanly

    loop = asyncio.get_event_loop()
    loop.run_until_complete(make_request())
else:
    print('Fires a JavaScript window event with the given name in any loaded browser source within OBS.')
    print()
    print('In the HTML/JavaScript loaded in your browser source, subscribe using the following JS snippet:')
    print('window.addEventListener("[eventName]", function() { /* ... */ });')
    print()
    print('Usage: fire_browser_event.py [eventName] [websocketUrl] [websocketPassword]')