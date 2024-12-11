pushpin-labeler
---------------
A BlueSky Labeler service which labels (and by default, hides) posts which use the 📌 emoji.

There is a custom feed which shows people posts they've replied to with 📌, but that can
clutters other people's feeds with no-information posts. It is based on the [@skyware/labeler](https://skyware.js.org/guides/labeler/introduction/getting-started/)
starter kit.

Mostly this is an excuse to try writing a labeler.

For this to actually function in the ATProto universe, it needs to be deployed to the service defined
in a given labeler's DID document under the `#atproto_labeler` service. You can run it locally, but the 
labels will not be seen by subscribers.

The labeler we've set up for this has DID `did:plc:sbnsfdwbgbtfgsp35377cysf` and is currently at 
at://pushpin-labeler.bsky.social; the labeler service is configured to run at https://pushpin-labeler.knightlab.com

getting started
---------------
This project uses `nvm` to manage the node version. See `.nvmrc` for the definitive version, but currently set
to `lts/iron`  If you have nvm installed, it should use that directly, at least for local development

After checking out the repo:
`npm install`

create a .env file that defines the following values. 
By now, you should have set up a BlueSky account for which you have a DID and password (the password can be an app password)
The signing key comes from setting up the labeler, using `npx @skyware/labeler setup`
LABELER_DID
LABELER_PASSWORD
SIGNING_KEY
DEBUG (optional, set to `true` to see log output)

`npm start`
will start the labeler service, which listens to the BlueSky Jetstream and creates labels as appropriate. Labels are stored
in a database. For local development, they are stored using SQLite in a database named `labels.db` (with some associated files). 
For now, we'll use SQLite in production too, although eventually, we may want to switch to another database. While we are using
SQLite, you should not deploy copies of the `labels.db*` files, or you would overwrite any labels created by the production service.
