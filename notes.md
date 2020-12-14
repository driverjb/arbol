# Arbol 1.0 Notes
- Build a class for using services
- All service calls will take in the request object as input
- Maybe consider cleaner passing of values, etc. All in the arbol object perhaps
- Leaf definition will no long take a raw responder function. It will just take a service
    - Within the leaf definition and collection, the req and res objects will call the service
      and use the input and output properly.
- Leaf definition will be:
    - Path, Method, Service, and Twigs (middlewares). Might change the name of this too. Twigs
      was a stretch tying to be like the "tree theme". It might just make it harder to follow.
