"use strict";
/**
 * @author ghostxbh
 * @date 2020/4/3
 * @description ip 处理中间件
 */
const ip = require('ip');
const os = require('os');

/**
 * 获取内网IP
 * @param name
 * @param family
 * @returns {string}
 */
function intranet_ip(name, family) {
    const intranetIp = name || family ? ip.address(name, family) : ip.address();
    return intranetIp ? intranetIp : '127.0.0.1';
}

/**
 * 获取所有网卡信息
 * @param name
 * @param family
 * @returns {NetworkInterfaceInfo[]|undefined}
 */
function localAllNetworkInfo(name, family) {
    const interfaces = os.networkInterfaces();
    /**
     * is default ipv4
     */
    family = family ? family.toLowerCase() : 'ipv4';
    /**
     * If a specific network interface has been named,
     * return the address.
     */
    if (name && name !== 'private' && name !== 'public') {
        const res = interfaces[name].filter(function (details) {
            const itemFamily = details.family.toLowerCase();
            details.ifname = name;
            return itemFamily === family;
        });
        if (res.length === 0) {
            return undefined;
        }
        return res;
    }

    return Object.keys(interfaces).map(function (nic) {
        /**
         * Note: name will only be `public` or `private`
         * when this is called.
         */
        const addresses = interfaces[nic].filter(function (details) {
            details.family = details.family.toLowerCase();
            details.ifname = nic;
            if (details.family !== family || ip.isLoopback(details.address)) {
                return false;
            } else if (!name) {
                return true;
            }
            return name === 'public' ? ip.isPublic(details.address) : ip.isPrivate(details.address);
        });
        return addresses.length ? addresses : undefined;
    }).filter(Boolean);
}

module.exports = {intranet_ip, localAllNetworkInfo};
