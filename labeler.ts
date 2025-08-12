import { LabelerServer } from "@skyware/labeler";
import { Jetstream } from "@skyware/jetstream";
import WebSocket from "ws";

// Check required environment variables
const LABELER_DID = process.env.LABELER_DID;
const SIGNING_KEY = process.env.SIGNING_KEY;
const DEBUG = process.env.DEBUG ?? '';
if (!LABELER_DID || !SIGNING_KEY) {
    console.error("Missing required environment variables:");
    if (!LABELER_DID) console.error("- LABELER_DID");
    if (!SIGNING_KEY) console.error("- SIGNING_KEY");
    process.exit(1);
}

function debug(msg) {
    if (DEBUG.toLocaleLowerCase() != 'true') return
    console.log(msg)
}
const server = new LabelerServer({
	did: LABELER_DID,
	signingKey: SIGNING_KEY,
});

server.start(14831, (error) => {
	if (error) {
		console.error("Failed to start: ", error);
	} else {
		debug("Listening on port 14831");
	}

});


function atURIfromMessage(msg) {
    let at_uri = `at://${msg.did}`
    if (msg.kind == 'commit') {
        at_uri = `${at_uri}/${msg.commit.collection}/${msg.commit.rkey}`
    }
    return at_uri
}


function onCreate(event) {
    try {
        if (event.commit.record.reply) {
            let text = event.commit.record.text.trim()
            if (text.match(/📌/)) {
                let at_uri = atURIfromMessage(event)
                let label = 'pushpin-plus'
                if (text.match(/^📌$/)) {
                    label = 'pushpin-only'
                } 
                debug(`${label} ${at_uri}`)
                server.createLabel({
                    uri: at_uri,
                    val: label
                }).then(
                    label => {
                        debug(`created label for ${at_uri}`)
                        debug(`src: ${label.src}`)
                        debug(`uri: ${label.uri}`)
                        debug(`val: ${label.val}`)
                        debug(`cts: ${label.cts}`)
                        debug(`ver: ${label.ver}`)
                        debug(`cid: ${label.cid}`)
                        debug(`exp: ${label.exp}`)
                        debug(`sig: ${label.sig}`)
                        debug('---------')
                    },
                    reason => debug(`rejected: ${reason}`)
                )
            }
        }
    } catch (error) {
        console.error(error)
        debug(error)        
    }
}

function onError(error, cursor) {
    console.error('Jetstream error:', error);
    if (cursor) {
        console.error('Last known cursor:', cursor);
    }
    
    // Wait a bit before attempting to reconnect
    // this only tries once... and is it possible that the 
    // jetstream is still running?
    setTimeout(() => {
        console.log('Attempting to reconnect...');
        listenToJetstream(cursor)
    })
}

function listenToJetstream(cursor) {
    const jetstream = new Jetstream({
        ws: WebSocket,
        wantedCollections: ["app.bsky.feed.post"],
        cursor
    });

    jetstream.onCreate("app.bsky.feed.post", onCreate);

    jetstream.on("error", onError)

    jetstream.start()

}

listenToJetstream(null)
