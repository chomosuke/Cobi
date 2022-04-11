## Approach and Scaling

websocket (one per account) for notification is all on one single instance.

websocket for call are on other instances with a load balancer where the load balancer make sure for each chat, the websocket gets routed to the same instance.

RESTapi are all on their own instances with an ordinary load balancer.

frontend interact with all three backends. It'll be served from the RESTapi backend.

All backends will interact with the auth micro service. The auth micro service will parse username & password into auth token, and parse auth token into userId. It'll also be responsible for authorizing user to access various entities. It's written in typescript.

RESTapi backend is written in typescript. partially because I want to try out some new technology. Apart from doing RESTapi stuff, it'll also be responsibly for providing all the environment variables for frontend to find the other two services.

websocket backends will be written in rust (possibly with actix). Rust's performance and ability to multithread with relative ease would help the scaling of websocket.

Anything written in rust should not access the database, let the auth micro service / rest backend do it.

## database design

- users
    - id
    - username
    - password
