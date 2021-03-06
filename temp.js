// // Define a simple template to safely generate HTML with values from user"s profile
// var template = handlebars.compile(`
// <head><head><title>Twitch Auth Sample</title></head>
// <table>
//     <tr><th>Access Token</th><td>{{accessToken}}</td></tr>
//     <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>
//     <tr><th>Display Name</th><td>{{display_name}}</td></tr>
//     <tr><th>Bio</th><td>{{bio}}</td></tr>
//     <tr><th>Image</th><td>{{logo}}</td></tr>
// </table></head>`);



// If user has an authenticated session, display it, else redirect to authenticate



    // res.send(template(req.session.passport.user));



//     res.send(`<html>
//   <head>
//     <title>Redirecting to authentication</title>
//   </head>

//   <script>
//     window.location.href="/auth/twitch";
//   </script>
// </html>`);