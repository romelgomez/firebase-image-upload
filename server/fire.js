/*

https://firebase.google.com/support/guides/firebase-web
https://firebase.google.com/docs/server/setup
https://firebase.google.com/docs/auth/server/

*/

var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: {
    "type": "service_account",
    "project_id": "project-966415674961578791",
    "private_key_id": "b32417468bf5e33e6149a083f4ca354644373de2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCQjXS5d4j8ohes\npyiSUG1pJOlB32kq3sP9a4DfqAVrM8GBk5tx32LpCivXloaGeSA0oo9LQ8KavLON\n4bcVrRhoDPDjFVgiz7IqO3y83wyQhCc9rBx31Vmk+/3rDeZZayu6QmNYbABBZgkB\nYNDP3xwP9VlWBe7CH+GdE2xLoLSllVTDUa1vDvkFllOqtMTDcc/7d3vOOySGQX04\nGmR6yEb2NzgI1QWegVL6TYLz7Ey3AomK5AqdN+kEMLi3tQ/NeaTVrYXah9EXe8MA\n3T/H8+NHdxI0t7nZiTMbAIeiM2uMV/KRRsqKHjewSqI/XnP/6bwwsDmHAlDL+Zgz\nf8QMVLtHAgMBAAECggEANBvaLRWrOy8Pi7zCgmQd3N5ie82Wss6VJmC/l2CRe4Cv\nzA8y5QzbMhjpjxEDM6yscGz9bOtjVraZn5bzkgvRFYk8uQ+zsvDeUB0brVZWyC3r\nm27U4Fn3s+LnOPnMxQU+QSm3eGOOgATRUD7fZ2ANVK9kYf9Hf5FQmngq/ORU2q97\n3GXN6exJkOoTDcUW6bfq7fHQBLnczs/hZ1Zo2wRGP6yHkRZA5gqtiz212ojGfvl/\naSKoH6/rIxlZYspUFlswn8qQNzoZLcHODZXGRD1Hj+2tA0o2ogNH2e5jN/arGVZS\nDXzEhkAYMOtExlS9wY3qkhvbo5upGLimt7S6n9hzCQKBgQDWPUokCU6Ies5jDvAk\nNlOQjDiKwjhkCvt7mbSsGm8q/QKgmQy0NekOJuom0Y/+ycD6dWLGde22AtQpQnc3\nFQhweI41KRCI7CB7bG4hbbyMZmBSgaP2+ZFm1D0/zRzLty5Lkss9PNXoQJDtmSGU\nlM4Y7gG2dmlOCllRYVzFjTVb1QKBgQCsur1AsOWlI0TQZREGNKTr0JaYHvxf4d8z\n+2TMDMTOINtPsh9PNKbWPtW+U8QMOFl4Qa64aLICg52XuWy2p9PgjvoEh4b9W/0V\nofADnrGSRN0ti1FJ69WUU/Vc5Mp6r9bL0+CkA47/21qtbRVPQ6ANUqCqlB8euw/t\nAiVlaRTUqwKBgGG4QQog6J5eDaenV6fc08759oxsPJZ9X+on2P4rbIuaLkmcpevJ\nL02SOHmOWvTnh8t2IaDOh6fesHFFbOVGBbxvcMYUvgMGWWaStcUvrbIIvGTF10k+\n2rChnHJul3TgUBCOm3+KMTOnx7NohqWkHkHGxic46Z18IPN6ynsdhrolAoGBAIaj\nGJmwSZCrKRx3awm3R0Y41OnGXVovqdfPAQa8fTtfCRPZ9+W5WMJvQBSXHp2X3sWK\nDTLZCMhE5zY45rCJqPHFAMU/Ds22QlP2YiuwKyGkY/L4QWipV1XDC+JYxCtVnMxM\nXzH5RCHTTZ8ZBB9AyyUXXv0XcBp4HTXVEmk1u3L5AoGBAIcjatnduDUo8/+i1i0R\nnX16jsy/dwUmLJ9CfZ/OOVNX47PKA6jYSic7nn/c7DZT6fo7x2r39O9DYGxO2xEO\nA8OPu9uU1k7lC5VE7HoEeJN/RuC+lK8aajcZZsn1IXm9s3SL62ljvSZ49OHt7GR5\nz4G3RlQ0Cn5+YQ0MKnvTHhQN\n-----END PRIVATE KEY-----\n",
    "client_email": "berlin@project-966415674961578791.iam.gserviceaccount.com",
    "client_id": "118392023343950260633",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/berlin%40project-966415674961578791.iam.gserviceaccount.com"
  },
  databaseURL: "https://berlin.firebaseio.com"
});

module.exports = {
  FireRef: firebase.database().ref()
};