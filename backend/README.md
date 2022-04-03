## Approach and Scaling

websocket (one per account) for notification is all on one single instance.

websocket for call are on other instances with a load balancer where the load balancer make sure for each chat, the websocket gets routed to the same instance.

RESTapi are all on their own instances with an ordinary load balancer.

frontend interact with all three backends, thought it's served from the RESTapi backend.

RESTapi backend is written in typescript. partially because i want to try out some new technology.

websocket backends will be written in rust. Rust's performance and ability to multi thread with relative ease would help the scaling of websockets.
