'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const c = require("./constants");
async function setStateAsyncEx(that, _id, _value, _common, _setValueOnlyStateCreated = false, _setValueDelay = 0) {
    that.log.debug('setStateAsyncEx started for id "' + _id + '"; value: ' + _value + '; common: ' + JSON.stringify(_common) + '"; _setValueOnlyStateCreated: ' + _setValueOnlyStateCreated);
    let bValueChanged = false;
    try {
        return await that.setObjectNotExistsAsync(_id, {
            type: 'state',
            common: _common,
            native: {},
        })
            .then(async (obj) => {
            that.log.debug('setStateAsyncEx, setObjectNotExistsAsync, id: ' + _id + '; obj:' + JSON.stringify(obj) + '<<<');
            // obj == undefined --> object aleady exist, obj == obj:{"id":"fb-tr-064.0.devices.iFranks.IP"} --> created
            if (((obj == undefined) && !(_setValueOnlyStateCreated)) || (obj != undefined)) {
                // state already exist -->  no value should be set || state new created --> set value
                if (_setValueDelay > 0) {
                    await that.getStateAsync(_id)
                        .then((obj) => {
                        that.log.debug('getStateAsyncEx, getStateAsync, obj:' + JSON.stringify(obj) + '<<<');
                        if (obj.val != _value) {
                            bValueChanged = true;
                            setTimeout(() => {
                                that.setStateAsync(_id, _value, true);
                            }, _setValueDelay);
                        }
                    });
                }
                else {
                    await that.setStateChangedAsync(_id, _value, true)
                        .then((obj) => {
                        that.log.debug('setStateAsyncEx, setStateChangedAsync, obj:' + JSON.stringify(obj) + '<<<');
                        // obj:{"id":"fb-tr-064.0.devices.iFranks.IP","notChanged":true}
                        bValueChanged = !obj.notChanged;
                    });
                    that.log.debug('setStateAsyncEx, set "' + _id + '" to "' + _value + '"');
                    that.log.debug('setStateAsyncEx finished for id "' + _id + '" with bValueChanged: ' + bValueChanged);
                }
            }
            else {
                that.log.debug('setStateAsyncEx finished without set value for id "' + _id + '"');
            }
            return bValueChanged;
        })
            .catch((e) => that.log.error('error on "setStateAsyncEx() for id "' + _id + '": ' + e.message));
        //await that.setStateAsync(_id, _value, true);
    }
    catch (e) {
        that.log.error('error on "setStateAsyncEx()" for id "' + _id + '": ' + e.message);
        return bValueChanged;
    }
} // setStateAsyncEx()
exports.setStateAsyncEx = setStateAsyncEx;
async function getStateValAsyncEx(that, _id, _value) {
    try {
        return await that.getObjectAsync(_id)
            .then(async (objState) => {
            that.log.debug('getStateValAsyncEx, getObjectAsync: ' + JSON.stringify(objState));
            let dpvState = _value;
            if (objState) {
                const dpoState = await that.getStateAsync(objState._id);
                that.log.debug('getStateValAsyncEx, dpoState: ' + JSON.stringify(dpoState));
                if (dpoState)
                    dpvState = dpoState.val;
            }
            that.log.debug('getStateValAsyncEx, return dpvState: ' + JSON.stringify(dpvState));
            return dpvState;
        })
            .catch((e) => {
            that.log.error('error on "getStateValAsyncEx() for id "' + _id + '": ' + e.message);
            return _value;
        });
    }
    catch (e) {
        that.log.error('error on "getStateValAsyncEx()" for id "' + _id + '": ' + e.message);
        return _value;
    }
    return _value;
} // getStateValAsyncEx()
exports.getStateValAsyncEx = getStateValAsyncEx;
//!P!export async function createInstanceRootObjects(that: any, table: string, tableGuest: string): Promise<void> { // this, c.HTML + c.HTML_END, c.HTML_GUEST + c.HTML_END
async function createInstanceRootObjects(that) {
    that.log.debug('createInstanceRootObjects started');
    try {
        const getStateP = util.promisify(that.getState);
        const jStatesIndex = {
            id: 0,
            type: 1,
            name: 2,
            valType: 3,
            role: 4,
            val: 5,
            read: 6,
            write: 7,
            descr: 8
        };
        /*
            that.setObjectNotExistsAsync(
                'info',
                {
                    type: 'channel',
                    common: {
                        name: 'information',
                        role: 'info',
                    },
                    native: {},
                },
                function(err: any) {
                    if (err) _this.log.error('Cannot write object: ' + err);
                    else _this.log.debug('channel "info" created');
                },
            );
        */
        let idName = c.dppFB_Info_SupportedFunctions.substr(0, c.dppFB_Info_SupportedFunctions.length - 1);
        that.setObjectNotExistsAsync(idName, {
            type: 'channel',
            common: {
                name: idName,
                role: 'info',
            },
            native: {},
        });
        idName = c.dppDevices.substr(0, c.dppDevices.length - 1);
        that.setObjectNotExistsAsync(idName, {
            type: 'channel',
            common: {
                name: idName,
                role: 'info',
            },
            native: {},
        });
        const aStates = [
            //common.type (aStatesional - (default is mixed==any type) (possible values: number, string, boolean, array, object, mixed, file)
            ['info.connection', 'state', 'connection', 'boolean', 'indicator', false, true, false, 'Fritz!Box connection state'],
            [c.idFritzBoxVersion, 'state', c.idFritzBoxVersion, 'text', 'info', 0, true, false, 'Fritz!Box version'],
            [c.idCountDevicesTotal, 'state', c.idCountDevicesTotal, 'number', 'value', 0, true, false, 'Number of devices'],
            [c.idCountDevicesActive, 'state', c.idCountDevicesActive, 'number', 'value', 0, true, false, 'Number of active devices'],
            [c.idCountDevicesActiveLAN, 'state', c.idCountDevicesActiveLAN, 'number', 'value', 0, true, false, 'Number of active LAN devices'],
            [c.idCountDevicesActiveWLAN, 'state', c.idCountDevicesActiveWLAN, 'number', 'value', 0, true, false, 'Number of active WLAN devices'],
            [c.idCountDevicesActiveGuests, 'state', c.idCountDevicesActiveGuests, 'number', 'value', 0, true, false, 'Number of active WLAN devices from guests'],
            [c.idSupportedFunctions_FritzBoxVersion, 'state', c.idSupportedFunctions_FritzBoxVersion, 'string', 'info', '', true, false, 'Fritz!Box version of last check of supported functions'],
            [c.idFritzBoxName, 'state', c.idFritzBoxName, 'string', 'info', '', true, false, 'Fritz!Box name'],
            [c.idFritzBoxIP, 'state', c.idFritzBoxIP, 'string', 'info', '', true, false, 'Fritz!Box ip address'],
            [c.idFritzBoxMAC, 'state', c.idFritzBoxMAC, 'string', 'info', '', true, false, 'Fritz!Box mac address'],
            [c.idDeviceListAll_JSON, 'state', c.idDeviceListAll_JSON, 'string', 'info', '[]', true, false, 'JSON table, all devices'],
            [c.idDeviceListInactive_JSON, 'state', c.idDeviceListInactive_JSON, 'string', 'info', '[]', true, false, 'JSON table, all inactive devices'],
            [c.idDeviceListActive_JSON, 'state', c.idDeviceListActive_JSON, 'string', 'info', '[]', true, false, 'JSON table, all active devices'],
            [c.idDeviceListActiveLAN_JSON, 'state', c.idDeviceListActiveLAN_JSON, 'string', 'info', '[]', true, false, 'JSON table, all active LAN devices'],
            [c.idDeviceListActiveWLAN_JSON, 'state', c.idDeviceListActiveWLAN_JSON, 'string', 'info', '[]', true, false, 'JSON table, all active WLAN devices'],
            [c.idDeviceListActiveGuests_JSON, 'state', c.idDeviceListActiveGuests_JSON, 'string', 'info', '[]', true, false, 'JSON table, all active guests devices'],
            [c.idDeviceList_Warn_JSON, 'state', c.idDeviceList_Warn_JSON, 'string', 'info', '[]', true, false, 'JSON table, all watched devices'],
            [c.idDeviceList_Warn_active_JSON, 'state', c.idDeviceList_Warn_active_JSON, 'string', 'info', '[]', true, false, 'JSON table, all watched active devices'],
            [c.idDeviceList_Warn_inactive_JSON, 'state', c.idDeviceList_Warn_inactive_JSON, 'string', 'info', '[]', true, false, 'JSON table, all watched inactive devices'],
            [c.idDeviceList_NewAddedDevices_JSON, 'state', c.idDeviceList_NewAddedDevices_JSON, 'string', 'info', '[]', true, false, 'JSON table, all new added device from Fritz!Box'],
            [c.idDeviceList_RemovedDevices_JSON, 'state', c.idDeviceList_RemovedDevices_JSON, 'string', 'info', '[]', true, false, 'JSON table, all removed devices from Fritz!Box network list'],
            [c.idDeviceList_IPChanged, 'state', c.idDeviceList_IPChanged, 'boolean', 'info', false, true, false, 'ip address has changed'],
            [c.idDeviceList_OwnerChanged, 'state', c.idDeviceList_OwnerChanged, 'boolean', 'info', false, true, false, 'owner name has changed'],
            [c.idDeviceList_WarnChanged, 'state', c.idDeviceList_WarnChanged, 'boolean', 'info', false, true, false, 'warn state has changed'],
            [c.idDeviceList_WatchChanged, 'state', c.idDeviceList_WatchChanged, 'boolean', 'info', false, true, false, 'watch state has changed']
        ];
        for (let i = 0; i < aStates.length; i++) {
            await that.setObjectNotExists(aStates[i][jStatesIndex.id], {
                type: aStates[i][jStatesIndex.type],
                common: {
                    name: aStates[i][jStatesIndex.name],
                    type: aStates[i][jStatesIndex.valType],
                    role: aStates[i][jStatesIndex.role],
                    def: aStates[i][jStatesIndex.val],
                    read: aStates[i][jStatesIndex.read],
                    write: aStates[i][jStatesIndex.write],
                    desc: aStates[i][jStatesIndex.descr],
                },
                native: {},
            });
            if (await getStateP(aStates[i][jStatesIndex.id]) == null)
                that.setState(aStates[i][jStatesIndex.id], aStates[i][jStatesIndex.val], true); //set default
        }
        that.log.debug('createInstanceRootObjects finished');
    }
    catch (e) {
        that.log.error('error on "createInstanceRootObjects()"; ' + e.message);
    }
} // createInstanceRootObjects()
exports.createInstanceRootObjects = createInstanceRootObjects;
//export async function updateDevices(that: any, aCfgDevicesList: JSON[], aAllActiveDevices: JSON[]) {
async function updateDevices(that, aCfgDevicesList, aAllDevices) {
    const fctNameId = 'updateDevices';
    that.log.debug(fctNameId + ' started');
    that.log.debug(fctNameId + ', aAllActiveDevices: ' + JSON.stringify(aAllDevices));
    /* !P!
    Wenn neue Option "delete unwatched" aktiv, dann  über Selector DP-Liste erstellen und beim Durchlauf verarbeitete löschen
    nach Durchlauf alle DPs in Liste löschen
    */
    let bDataChangedIP = false;
    let bDataChangedOwner = false;
    let bDataChangedWarn = false;
    let bDataChangedWatch = false;
    let aCfgDevicesListOld = that.config.devicesListOld;
    that.log.debug(fctNameId + ', aCfgDevicesListOld: ' + JSON.stringify(aCfgDevicesListOld));
    if (!aCfgDevicesListOld) {
        aCfgDevicesListOld = aCfgDevicesList;
    }
    aCfgDevicesList.map(function (oCfgDevice) {
        that.log.debug(fctNameId + ', oCfgDevice: ' + JSON.stringify(oCfgDevice));
        // {"devicename":"Acer-NB","macaddress":"00:1C:26:7D:02:D6","ipaddress":"192.168.200.157","ownername":"","interfacetype":"","active":false,"watch":true}
        let oDeviceData = {};
        const oCfgDeviceOld = aCfgDevicesListOld.find(function (item) { return item.macaddress === oCfgDevice.macaddress; });
        that.log.debug(fctNameId + ', oCfgDeviceOld: ' + JSON.stringify(oCfgDeviceOld));
        if (oCfgDevice.macaddress == '') {
            oDeviceData = aAllDevices.find(function (item) { return item.IPAddress === oCfgDevice.ipaddress; });
            //!P! hier müsste ein Mechanismus rein, der diesen Meldungstype nach n Meldungen für den Tag abschaltet; that.log.warn('device "' + oCfgDevice.devicename + '" without MAC address; IP: "' + oDeviceData.IPAddress + '"');
        }
        else {
            oDeviceData = aAllDevices.find(function (item) { return item.MACAddress === oCfgDevice.macaddress; });
        }
        if (oCfgDevice.watch) {
            // device watched, create datapoints / update value
            check_set_deviceData(that, oCfgDevice, oDeviceData);
        }
        if (oCfgDevice.warn) {
            // warn if device goes off
            if (oCfgDevice.active != oDeviceData.Active && oDeviceData.Active == true) {
                // device goes off
                that.log.warn('device "' + oCfgDevice.devicename + '" goes off');
            }
        }
        if (oDeviceData) {
            if (oDeviceData.IPAddress != oCfgDevice.ipaddress) {
                // IP has changed
                if (that.config.warning_destination == 'log') {
                    that.log.warn('IP-address for device "' + oCfgDevice.devicename + '" changed (old: "' + oCfgDevice.ipaddress + '"; new: "' + oDeviceData.IPAddress + '"; MAC: "' + oDeviceData.MACAddress + '"');
                }
                if (that.config.warning_destination == 'telegram.0') {
                    that.sendTo('telegram.0', (new Date(), "JJJJ.MM.TT SS:mm:ss") + ' MAC-address for device "' + oCfgDevice.devicename + '" changed (old: "' + oCfgDevice.ipaddress + '"; new: "' + oDeviceData.IPAddress + '"; MAC: "' + oDeviceData.MACAddress + '"');
                }
                // update aCfgDevicesList
                const idx = aCfgDevicesList.indexOf(oCfgDevice);
                if (idx >= 0) {
                    aCfgDevicesList[idx].ipaddress = oDeviceData.IPAddress;
                    bDataChangedIP = true;
                }
            }
            if (oCfgDeviceOld.ownername != oCfgDevice.ownername) {
                // owner has changed
                bDataChangedOwner = true;
            }
            if (oCfgDeviceOld.warn != oCfgDevice.warn) {
                // warn has changed
                bDataChangedWarn = true;
            }
            if (oCfgDeviceOld.watch != oCfgDevice.watch) {
                // watch has changed
                bDataChangedWatch = true;
            }
        }
    });
    //bDataChenged --> bDataChanged als Parameter in that.config.devicesList_IPChanged = bDataChanged
    if (bDataChangedIP)
        that.config.devicesList = aCfgDevicesList;
    that.config.devicesList_IPChanged = bDataChangedIP;
    that.config.devicesList_OwnerChanged = bDataChangedOwner;
    that.config.devicesList_WarnChanged = bDataChangedWarn;
    that.config.devicesList_WatchChanged = bDataChangedWatch;
    that.config.devicesListOld = that.config.devicesList;
    that.log.debug(fctNameId + ' finished');
} // updateDevices()
exports.updateDevices = updateDevices;
async function check_set_deviceData(that, oCfgDevice, oDeviceData) {
    // check data points exist: active, IP, lastIP, MAC, lastMAC, lastActive, lastInactive
    // and update there values
    // Wenn MAC oder IP sich ändert, Message, wenn enabled
    const fctNameId = 'check_set_deviceData';
    that.log.debug(fctNameId + ' started for oCfgDevice: ' + JSON.stringify(oCfgDevice) + '; oDeviceData: ' + JSON.stringify(oDeviceData));
    //oCfgDevice: {"devicename":"Acer-NB","macaddress":"00:1C:26:7D:02:D6","ipaddress":"192.168.200.157","ownername":"","interfacetype":"","active":false,"watch":true}; oDeviceData: undefined
    try {
        that.log.debug(fctNameId + ', create device "' + c.dppDevices + oCfgDevice.devicename + '"');
        // create device node
        that.setObjectNotExistsAsync(c.dppDevices + oCfgDevice.devicename, {
            type: 'device',
            common: {
                name: oCfgDevice.devicename,
                role: 'info',
            },
            native: {},
        });
    }
    catch (err) {
        that.log.error(fctNameId + ', error on create device for id "' + c.dppDevices + oCfgDevice.devicename + '": ' + err.message);
    }
    try {
        let idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceActive;
        let idStateValue = (((oDeviceData) && (oDeviceData.Active) && oDeviceData.Active == 'true') ? true : false);
        const dtCcurrent = new Date().getTime();
        that.log.debug(fctNameId + ', create state "' + idState + '"; set value: "' + idStateValue + '"; oDeviceData: ' + JSON.stringify(oDeviceData));
        let bValueChanged = await setStateAsyncEx(that, idState, idStateValue, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceActive,
            type: 'boolean',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceActive,
        }, false, 200); // set value with delay
        if (bValueChanged)
            that.log.warn(fctNameId + ', id "' + idState + '"; set value: "' + idStateValue + '"');
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastActive;
        await setStateAsyncEx(that, idState, 0, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceLastActive,
            type: 'number',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceLastActive,
        }, true); // set "0" only, if state new created
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastInactive;
        await setStateAsyncEx(that, idState, 0, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceLastInactive,
            type: 'number',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceLastInactive,
        }, true); // set "0" only, if state new created
        if (bValueChanged) {
            // value has changed
            if (idStateValue) {
                idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastActive;
                that.setStateAsync(idState, dtCcurrent);
            }
            else {
                idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastInactive;
                that.setStateAsync(idState, dtCcurrent);
            }
            that.log.warn(fctNameId + ', idState "' + idState + '"; set value dtCcurrent: "' + dtCcurrent + '" (' + that.formatDate(dtCcurrent, 'YYYY.MM.DD SS:mm:ss'));
        }
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceName;
        setStateAsyncEx(that, idState, oCfgDevice.devicename, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceName,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceName,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceHostname;
        setStateAsyncEx(that, idState, ((oDeviceData) ? oDeviceData.HostName : ''), {
            name: oCfgDevice.devicename + '.' + c.idnDeviceHostname,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceHostname,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceMAC;
        setStateAsyncEx(that, idState, ((oDeviceData) ? oDeviceData.MACAddress : oCfgDevice.macaddress), {
            name: oCfgDevice.devicename + '.' + c.idnDeviceMAC,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceMAC,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastMAC;
        setStateAsyncEx(that, idState, oCfgDevice.macaddress, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceLastMAC,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceLastMAC,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceIP;
        setStateAsyncEx(that, idState, ((oDeviceData) ? oDeviceData.IPAddress : oCfgDevice.ipaddress), {
            name: oCfgDevice.devicename + '.' + c.idnDeviceIP,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceIP,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceLastIP;
        idStateValue = oCfgDevice.ipaddress;
        that.log.debug(fctNameId + ', create state "' + idState + '"; set value: "' + idStateValue);
        setStateAsyncEx(that, idState, idStateValue, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceLastIP,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceLastIP,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceOwner;
        setStateAsyncEx(that, idState, oCfgDevice.ownername, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceOwner,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceOwner,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceInterfaceType;
        setStateAsyncEx(that, idState, ((oDeviceData) && oDeviceData.InterfaceType != '' ? oDeviceData.InterfaceType : oCfgDevice.interfacetype), {
            name: oCfgDevice.devicename + '.' + c.idnDeviceInterfaceType,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceInterfaceType,
        });
        // '{"IPAddress": "' + oDevice.IPAddress + '", "MACAddress": "' + oDevice.MACAddress + '", "HostName": "' + oDevice.HostName + '"'
        //  ', "InterfaceType": "' + oDevice.InterfaceType + '", "Port": "' + oDevice['X_AVM-DE_Port'] + '", "Speed": "' + oDevice['X_AVM-DE_Speed'] + '"}';
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceFbPort;
        idStateValue = ((oDeviceData) ? oDeviceData.Port : '');
        that.log.debug(fctNameId + ', create state "' + idState + '"; set value: "' + idStateValue);
        setStateAsyncEx(that, idState, idStateValue, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceFbPort,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceFbPort,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceFbSpeed;
        setStateAsyncEx(that, idState, ((oDeviceData) && (oDeviceData.Speed)) ? oDeviceData.Speed : 0, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceFbSpeed,
            type: 'string',
            role: 'info',
            def: '',
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceFbSpeed,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceFbGuest;
        setStateAsyncEx(that, idState, (((oDeviceData) && (oDeviceData.Guest) && (oDeviceData.Guest == '1')) ? true : false), {
            name: oCfgDevice.devicename + '.' + c.idnDeviceFbGuest,
            type: 'boolean',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceFbGuest,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceFbWarn;
        setStateAsyncEx(that, idState, oCfgDevice.warn, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceFbWarn,
            type: 'boolean',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceFbWarn,
        });
        idState = c.dppDevices + oCfgDevice.devicename + '.' + c.idnDeviceFbWatch;
        setStateAsyncEx(that, idState, oCfgDevice.watch, {
            name: oCfgDevice.devicename + '.' + c.idnDeviceFbWatch,
            type: 'boolean',
            role: 'info',
            def: false,
            read: true,
            write: false,
            desc: oCfgDevice.devicename + '.' + c.idnDeviceFbWatch,
        });
    }
    catch (err) {
        that.log.error(fctNameId + ', error on create state for device "' + c.dppDevices + oCfgDevice.devicename + '": ' + err.message);
    }
} // check_set_deviceData()
//# sourceMappingURL=instance-objects.js.map