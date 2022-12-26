# ProjectFines
A lightweight backend vehicle traffic fine issuer and payment system. This project is a Node.JS backend using MongoDB. On a high level, a user may be one of 3 roles, an admin, a regular user, or a traffic police officer. The details of the specifc APIs are omitted in this README, so for now just know the traffic police officer may create offenses, and a civilian user has to pay for offenses generated. The admin is a superuser that has the power to alter user profiles and offenses.

# .env
In order to use this application, you'll need a .env file. In there, provide these details:
- A MongoDB URI called `MONGO_URI`
- 3 JWT secret tokens
  - JWT_SECRET_POLICE
  - JWT_SECRET_USER
  - JWT_SECRET_ADMIN
- JWT_LIFETIME (1d suggested)
- Cloudinary API keys
  - CLOUD_NAME
  - CLOUD_API_KEY
  - CLOUD_API_SECRET
- Stripe payment API key
  - STRIPE_API_SECRET
  
# Discussion on APIs
I'll omit discussing each API in detail, since there are many and it's probable that if you're attempting to make use of my APIs that you have sufficient knowledge at REST APIs, NodeJS, and MongoDB. In general, APIs were built to be modular and scalable so an interested developer shouldn't have a hard time trying to adapt this code.

# Motivation for this project
This is my first independent Node project, and that was motivation to build this in of itself. The topic of my project wasn't motivated by any social issue or opinion that contemporary traffic fining systems needed fixing, it was simply convenient. 

# Limitations
As you can see, there is no frontend to this application. I am not a frontend developer, and I would rather spend my time honing my backend developing skills, so if you'd like to contribute a frontend to this application then be my guest. The real limitation of this app is that while I've ran some sufficiently complex tests with Postman, it hasn't been tested in an actual production environment, and thus is very likely literring with bugs. One might point out that I could've at least implemented some automated Mocha tests, but when I built this project as a rookie backend developer the knowledge that this was a possibility never crossed my mind and so was never done. Right now, I've moved past this project, not because its not interesting or I don't care about it, but I'm onward to bigger projects with more complexity, more on that in the next section. 

# Personal note on this project
As mentioned earlier, this was my very first NodeJS project that I designed from the ground up, then implemented, and tested. It was my first stepping stone project and doesn't ever need to be perfect enough for shipping to production. That said, this project is definitely not production grade and should not even be considered for use in production without first considering potential security concerns, and total debugging and testing. ProjectFines was a very helpful project to "get my feet wet" at backend development and there were valueble lessons gained through this project. I share this flawed project today not with the intention for somebody to work on it (even though that is encouraged if you desire), but as a portfolio project that others to glean at my rookie project and its outcome. Since this experience, I have worked on other backend projects in a professional environment which I am unfortunately not at liberty to share, and through thsoe experiences I am now a much better backend engineer than this project will reflect. My next big backend personal project is coming up and going to be featured here when it is ready.
