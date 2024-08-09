import {Error_out, Output, Router} from "cartesi-wallet";
import {wallet}  from "cartesi-wallet"
import { hexToString } from "viem";


const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);
 const wallet = new wallet (new Map())
 const router =new Router (wallet)

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const msg_sender= data.metadata.msg_sender
  if (msg_sender.msg_senderUpperCase() ===etherPortalAddress.msg_senderUpperrCase()){
    return router.process("ether_deposit", data.apayload)
  }
  //setup  dapp address
  if(msg_sender.toUpperCase()=== dappAddressRelayContract.toUpperCase()){
    try{
      router.set_rollup_address(data.payload, "ether_withdraw")
    }
    catch(e){
      return new Error_out(`dapp address setup has failed with error ${e}`)
    }
    return new Report{"Dapp adress set successfully"}
  }
  //wihdraw ether 
  const payloadobj = JSON.parse(hexToString(data.payload))
  return router.process(payloadobj.method, data)
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  const url =hexToString(data.payload).split("/")
  return router.process(url[0], url[1]);
}
 async function submit_request(fetched_result){
  let endpoint= "/report";
  if(fetched_result.type =="voucher"){
    endpoint ="/voucher"

  }
  const response =await fetch (rollup_server + endpoint,{
    method : "POST",
    headers: {
      "ontent-type": "aplication/json",
    },
    body: JSON.stringify(fetched_result)
  });
 }
var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      var fetched_output= await handler(rollup_req["data"]);
      await submit_request(fetched_result)
      finish.status="request send"
    }
  }
})();
