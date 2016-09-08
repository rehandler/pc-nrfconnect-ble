/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DiscoveryActions from '../actions/discoveryActions';
import * as AdapterActions from '../actions/adapterActions';

import DiscoveryButton from '../components/discoveryButton';
import DiscoveredDevice from '../components/DiscoveredDevice';
import TextInput from '../components/input/TextInput';
import { FormGroup, Checkbox } from 'react-bootstrap';

class DiscoveredDevices extends React.PureComponent {
    constructor(props) {
        super(props);

        const { toggleScan, clearDevicesList } = this.props;
        window.addEventListener('core:toggle-scan', () => { toggleScan(); });
        window.addEventListener('core:clear-scan', () => { clearDevicesList(); });
    }

    handleCheckedChange(property, e) {
        this.discoveryOptions[property] = e.target.checked;
        this.props.setDiscoveryOptions(this.discoveryOptions);
    }

    handleFilterChange(e) {
        this.discoveryOptions.filterString = e.target.value;
        this.props.setDiscoveryOptions(this.discoveryOptions);
    }

    handleOptionsExpanded() {
        this.props.toggleOptionsExpanded();
    }

    render() {
        const {
            discoveredDevices,
            discoveryOptions,
            isScanning,
            adapterIsConnecting,
            isAdapterAvailable,
            clearDevicesList,
            toggleScan,
            connectToDevice,
            cancelConnect,
            toggleExpanded,
            toggleOptionsExpanded,
        } = this.props;

        this.discoveryOptions = this.props.discoveryOptions.toJS();

        const progressStyle = {
            visibility: isScanning ? 'visible' : 'hidden',
        };

        const dirIcon = discoveryOptions.expanded ? 'icon-down-dir' : 'icon-right-dir';

        const discoveryOptionsDiv = discoveryOptions.expanded ?
            <div className='discovery-options'>
                <Checkbox className='adv-label'
                    defaultChecked={discoveryOptions.sortByRssi}
                    onChange={e => this.handleCheckedChange('sortByRssi', e)}>
                    Sort by signal strength
                </Checkbox>
                <TextInput inline title='Filter list by device name or address' label='Filter:' className='adv-value'
                           defaultValue={discoveryOptions.filterString} onChange={e => this.handleFilterChange(e)}
                           labelClassName='' wrapperClassName='' placeholder='Device name or address' />
            </div> : '';

        return (
            <div id='discoveredDevicesContainer'>
                <div>
                    <h4>
                        Discovered devices
                        <img className='spinner' src='resources/ajax-loader.gif' height='16' width='16' style={progressStyle} />
                    </h4>
                </div>

                <div className='padded-row'>
                    <DiscoveryButton scanInProgress={isScanning} adapterIsConnecting={adapterIsConnecting} isAdapterAvailable={isAdapterAvailable} onScanClicked={() => toggleScan()} />
                    <button title='Clear list (Alt+C)' onClick={() => clearDevicesList()} type='button' className='btn btn-primary btn-sm btn-nordic padded-row'>
                        <span className='icon-trash' />Clear
                    </button>
                    <div className='discovery-options-expand' >
                        <span onClick={toggleOptionsExpanded}><i className={dirIcon} />Options</span>
                        {discoveryOptionsDiv}
                    </div>

                </div>

                <div style={{paddingTop: '0px'}}>
                    {   discoveredDevices.map((device, address) =>
                        {
                            return (
                                <DiscoveredDevice key={address}
                                    device={device}
                                    standalone={false}
                                    adapterIsConnecting={adapterIsConnecting}
                                    isConnecting={device.isConnecting}
                                    onConnect={device => connectToDevice(device)}
                                    onCancelConnect={() => cancelConnect()}
                                    onToggleExpanded={toggleExpanded} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { discovery, adapter } = state;

    let selectedAdapter = null;
    let adapterIsConnecting = false;
    let scanning = false;
    let adapterAvailable = false;

    if (adapter.selectedAdapter !== undefined && adapter.selectedAdapter !== null) {
        selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

        if (selectedAdapter && selectedAdapter.state) {
            adapterIsConnecting = selectedAdapter.state.connecting || false;
            scanning = selectedAdapter.state.scanning || false;
            adapterAvailable = selectedAdapter.state.available || false;
        }
    }

    return {
        discoveredDevices: discovery.devices,
        discoveryOptions: discovery.options,
        adapterIsConnecting: adapterIsConnecting,
        isScanning: scanning,
        isAdapterAvailable: adapterAvailable,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
            {},
            bindActionCreators(DiscoveryActions, dispatch),
            bindActionCreators(AdapterActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DiscoveredDevices);

DiscoveredDevices.propTypes = {
    discoveredDevices: PropTypes.object.isRequired,
    isAdapterAvailable: PropTypes.bool.isRequired,
    isScanning: PropTypes.bool.isRequired,
    adapterIsConnecting: PropTypes.bool.isRequired,
    clearDevicesList: PropTypes.func.isRequired,
    toggleScan: PropTypes.func.isRequired,
    connectToDevice: PropTypes.func.isRequired,
    cancelConnect: PropTypes.func.isRequired,
};
