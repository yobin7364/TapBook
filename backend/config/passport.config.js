import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import keys from "./keys.config.js";
import User from "../models/User.module.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretOrKey,
};

const initializePassport = () => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          // If user is found, pass user data to `done`
          return done(null, user);
        }
        // If user is not found, return false (authentication failed)
        return done(null, false, { message: "User not found" });
      } catch (err) {
        // Log any errors and pass them to the `done` callback
        console.error(err);
        return done(err, false, {
          message: "Error occurred during authentication",
        });
      }
    })
  );
};

export default initializePassport;
