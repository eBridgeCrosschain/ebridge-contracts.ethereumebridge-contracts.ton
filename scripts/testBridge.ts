import {compile, NetworkProvider} from "@ton/blueprint";
import {Bridge} from "../wrappers/Bridge";
import {Address, beginCell, toNano} from '@ton/core';
import {randomAddress} from "@ton/test-utils";
import bs58 from "bs58";
import {Buffer} from "buffer";
import aelf from "aelf-sdk";
import {JettonMinter} from "../wrappers/JettonMinter";
import {JettonWallet} from "../wrappers/JettonWallet";
import {BridgeSwap} from "../wrappers/BridgeSwap";
import {BridgePool} from "../wrappers/BridgePool";

export async function run(provider: NetworkProvider, args: string[]) {

    const address = "EQDVfY0eShpaEvztwtIFf2a0ECwETJdhavHgF2J0tyhV69OJ";
    const bridge = provider.open(Bridge.createFromAddress(Address.parseFriendly(address).address));
    const bridgePoolAddress = Address.parseFriendly("EQAP_4H05mqqQBuBT0cJR9zbEOhIEHuhNVFb0hJDg_35BIe-");
    const bridgePool = provider.open(BridgePool.createFromAddress(bridgePoolAddress.address));
    const bridgeSwapAddress = Address.parseFriendly("EQC9DDj1FWAdrENyT4tCGL975mshr8nsaIPnfoODe3DdoBdY");
    const bridgeSwap = provider.open(BridgeSwap.createFromAddress(bridgeSwapAddress.address));

    const jetton_address = Address.parseFriendly("EQBSKUt9k20Gz8RqG71xloqnzcFHt0MdWg1UnWcyU5Xf9CsU");
    const jetton_minter = provider.open(JettonMinter.createFromAddress(jetton_address.address));

    const userWallet = async (address: Address) => provider.open(
        JettonWallet.createFromAddress(
            await jetton_minter.getWalletAddress(address)
        )
    );
    let receipt_amount = BigInt(500000);
    let forwardAmount = toNano('0.15');
    const chainId = 1931928;
    let targetAddress = "ZVJHCVCzixThco58iqe4qnE79pmxeDuYtMsM8k71RhLLxdqB5";
    let targetAddressBuffer = aelf.utils.base58.decode(targetAddress);
    const deployJettonWallet = await userWallet(provider.sender().address!);
    console.log(targetAddressBuffer.toString('hex'));
    let payload = Bridge.PackCreateReceiptBody(
        chainId, deployJettonWallet.address,
        Buffer.from(targetAddressBuffer), jetton_minter.address);
    await deployJettonWallet.sendTransfer(
        provider.sender(),
        toNano('0.2'),
        receipt_amount,
        bridge.address,
        provider.sender().address!,
        beginCell().storeUint(0,1).endCell(),
        forwardAmount,
        payload);

    // let targetAddress = "JKjoabe2wyrdP1P8TvNyD4GZP6z1PuMvU2y5yJ4JTeBjTMAoX";
    // const buffer = aelf.utils.base58.decode(targetAddress);
    // await bridge.sendTargetContract(provider.sender(), toNano('0.005'), [
    //     {
    //         chain_id: 1931928,
    //         bridge_address: buffer
    //     }]);

    // let target = await bridge.getTargetContractAddress(chainId);
    //
    // console.log(bs58.encode(target));
    //
    // let code1 = await compile('Bridge');
    // await bridge.sendInitCodeUpgrade(
    //     provider.sender(),
    //     toNano('0.01'),
    //     code1
    // );
    // await bridge.sendCancelUpgrade(provider.sender(), toNano('0.01'));
    // let code2 = await compile('BridgeSwap');
    // await bridgeSwap.sendInitCodeUpgrade(
    //     provider.sender(),
    //     toNano('0.01'),
    //     code2
    // );
    // let code3 = await compile('BridgePool');
    // await bridgePool.sendInitCodeUpgrade(
    //     provider.sender(),
    //     toNano('0.01'),
    //     code3
    // );
    
    // await bridge.sendFinalizeUpgradeCode(provider.sender(), toNano('0.01'));
    // await bridgeSwap.sendFinalizeUpgradeCode(provider.sender(), toNano('0.01'));
    // await bridgePool.sendFinalizeUpgradeCode(provider.sender(), toNano('0.01'));

    // let res = await bridge.getUpdate();
    // let a = res.asSlice();
    // let end_code = a.loadUint(64);
    // console.log(end_code);
    //
    // let swap = await bridgePool.getBridgeSwapAddress();
    // console.log(swap);
}
