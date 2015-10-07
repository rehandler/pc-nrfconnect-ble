/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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


import AddNewItem from './AddNewItem.jsx';
import ServiceItem from './ServiceItem';
import ServiceEditor from './ServiceEditor.jsx';
import CharacteristicEditor from './CharacteristicEditor.jsx';
import DescriptorEditor from './DescriptorEditor.jsx';
import KeyNavigation from '../common/TreeViewKeyNavigationMixin.jsx';
import hotkey from 'react-hotkey';

import {GattDatabases, GattDatabase, Service, Characteristic, Descriptor, Properties} from '../gattDatabases';

const readProperties = new Properties(0x02);
const notifyProperties = new Properties(0x10);
const indicateProperties = new Properties(0x20);

const readWriteProperties = new Properties(0x0A);
const readNotifyProperties = new Properties(0x12);

let attributeHandle = 1;
let gattDatabases = new GattDatabases();
let gattDatabase = gattDatabases.getGattDatabase('local');

let genericAccessService = new Service(gattDatabase, attributeHandle++, '0x1800');
let genericAttributeService = new Service(gattDatabase, attributeHandle++, '0x1801');

let ServerSetup = React.createClass({
    mixins: [KeyNavigation.mixin('gattDatabases', true)],
    getInitialState() {
        return { 
            selected: null, 
            gattDatabase: gattDatabase,
            showConfirmDialog: false
        };
    },
    _onSelected(selected) {
        this.setState({ selected: selected });
    },
    componentWillMount() {
        this.gattDatabases = gattDatabases;
    },
    _addService() {
        const service = new Service(gattDatabase, attributeHandle++);

        this.setState({gattDatabase: this.state.gattDatabase});
        this._onSelected(service);
    },
    _addCharacteristic(parent) {
        const handle = attributeHandle++;
        const valueHandle = attributeHandle++;

        const properties = new Properties();
        properties.read = true;
        properties.write = true;

        const characteristic = new Characteristic(parent, handle, undefined, valueHandle, properties);

        this.setState({gattDatabase: this.state.gattDatabase});
        this._onSelected(characteristic);
    },
    _addDescriptor(parent) {
        const descriptor = new Descriptor(parent, attributeHandle++);

        this.setState({gattDatabase: this.state.gattDatabase});
        this._onSelected(descriptor);
    },
    _onAttributeDeleted() {
        this.setState({selected: null, gattDatabase: this.state.gattDatabase});
    },

    render() {
        const selected = this.state.selected;
        const editor =
            !selected ? <div className="nothing-selected" />
            : selected.characteristics ? <ServiceEditor service={selected} onAttributeDeleted={this._onAttributeDeleted}/>
            : selected.descriptors ? <CharacteristicEditor characteristic={selected} onAttributeDeleted={this._onAttributeDeleted} />
            : selected._addBtnId ? <form />
            : <DescriptorEditor descriptor={selected} onAttributeDeleted={this._onAttributeDeleted}/>
        return (
            <div className="server-setup" style={this.props.style}>
                <div className="device-details-view">
                    <div className="service-items-wrap">
                        {this.state.gattDatabase.services.map((service, i) =>
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} item={service}
                                selected={this.state.selected} onSelected={this._onSelected} selectOnClick={true} addNew={true}
                                addCharacteristic={this._addCharacteristic} addDescriptor={this._addDescriptor} connectionHandle="-1" />
                        )}
                        <AddNewItem text="New service" id="add-btn-root" bars={1} selected={this.state.selected} onClick={this._addService} />
                    </div>
                    <div className="item-editor">
                        {editor}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ServerSetup;
