# Ship Radar

[Ship radar]()
web app that shows the ships in Saimaa Channel, which are going towards to the chosen lock. Ship data is fetched via REST api and the MQTT Websocket is used to track movements of the ships. I get the ship data from this [open data API](https://www.digitraffic.fi/en/marine-traffic/).

You can see the closest ship with its data from the ship element. You see also all incoming ships from the map. You can change ship by pressing "Vaihda laivaa" -button (only visible if multiple ships) or by using map and clickick other ship marker.

If no ships are coming, then no ships notification page is shown.

![image](https://user-images.githubusercontent.com/33766217/138605522-ccda8730-ea53-4e67-8e07-f2cfca609f04.png)

Website is not currently hosted because of the lack of ships in the channel.
