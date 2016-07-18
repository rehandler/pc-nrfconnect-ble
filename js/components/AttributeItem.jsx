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

import React from 'react';

import EnumeratingAttributes from './EnumeratingAttributes';

import Component from 'react-pure-render/component';

import AddNewItem from './AddNewItem';
import { Effects } from '../utils/Effects';
import * as Colors from '../utils/colorDefinitions';

import { getInstanceIds } from '../utils/api';
import { toHexString } from '../utils/stringUtil';

export const CCCD_UUID = '2902';

export default class AttributeItem extends Component {
    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor('brand-base');
        this.bars = 0;
        this.expandable = true;
        this.attributeType = 'attribute';
        this.childAttributeType = 'service';
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.item.value !== nextProps.item.value) {
            if (this.props.onChange) {
                this.props.onChange();
            }

            this._blink();
        }
    }

    componentWillUnmount() {
        if (!this.animation) {
            return;
        }

        this.animation.stop();
    }

    _onContentClick(e) {
        e.stopPropagation();
        this._selectComponent();
    }

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onSetAttributeExpanded(this.props.item, !this.props.item.expanded);
    }

    _childChanged() {
        if (this.props.onChange) {
            this.props.onChange();
        }

        if (!this.props.item.expanded) {
            this._blink();
        }
    }

    _blink() {
        if (this.animation) {
            this.animation.stop();
        }

        const fromColor = Colors.getColor('brand-primary');
        const toColor = Colors.getColor('brand-base');
        this.animation = Effects.blink(this, 'backgroundColor', fromColor, toColor);
    }

    _selectComponent() {
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item.instanceId);
        }
    }

    onAddAttribute(item) {
        const {
            onAddCharacteristic,
            onAddDescriptor,
        } = this.props;

        if (this.attributeType === 'service') {
            onAddCharacteristic(item);
        } else if (this.attributeType === 'characteristic') {
            onAddDescriptor(item);
        }
    }

    _isLocalAttribute() {
        const instanceIds = getInstanceIds(this.props.item.instanceId);
        return instanceIds.device === 'local.server';
    }

    _isCCCDAttribute(uuid) {
        return uuid === CCCD_UUID;
    }

    _onWrite(value) {
        this.props.onWrite(this.props.item, value);
    }

    _onRead() {
        this.props.onRead(this.props.item);
    }

    renderChildren() {
        return null;
    }

    renderName() {
        const {
            item,
        } = this.props;

        const {
            handle,
            uuid,
            name,
        } = item;

        const handleText = handle ? ('Handle: 0x' + toHexString(handle) + ', ') : '';
        return <div className={this.attributeType + '-name truncate-text'} title={handleText + 'UUID: ' + uuid}>{name}</div>;
    }

    renderError() {
        const {
            item,
        } = this.props;

        const {
            errorMessage,
        } = item;

        const errorText = errorMessage ? errorMessage : '';
        const hideErrorClass = (errorText === '') ? 'hide' : '';

        return <div className={'error-label ' + hideErrorClass}>{errorText}</div>;
    }

    renderContent(children) {
        return null;
    }

    getChildren() {
        const {
            item,
        } = this.props;

        const {
            expanded,
            discoveringChildren,
            children,
        } = item;

        const childrenList = [];

        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={'enumerating-' + this.childAttributeType} bars={this.bars + 1} />);
        } else if (children && expanded) {
            childrenList.push(this.renderChildren());
        }

        return childrenList;
    }

    render() {
        const {
            item,
            selected,
            addNew,
        } = this.props;

        const {
            instanceId,
            expanded,
            children,
        } = item;

        const barList = [];

        for (let i = 0; i < this.bars; i++) {
            barList.push(<div key={'bar' + (i + 1)} className={'bar' + (i + 1)} />);
        }

        const content = this.renderContent(null);
        const childrenList = this.getChildren();

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = !this.expandable || (children && children.size === 0 && !addNew) ? { display: 'none' } : {};
        const itemIsSelected = item.instanceId === selected;

        const backgroundClass = itemIsSelected ?
            'brand-background' :
            'neutral-background';//@bar1-color

        const backgroundColor = itemIsSelected ?
            '' :
            `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
            <div>
                <div className={this.attributeType + '-item ' + backgroundClass} style={{ backgroundColor }} onClick={e => this._onContentClick(e)}>
                    <div className='expand-area' onClick={e => this._onExpandAreaClick(e)}>
                        {barList}
                        <div className='icon-wrap'>
                            <i className={'icon-slim ' + expandIcon} style={iconStyle} />
                        </div>
                    </div>
                    <div className='content-wrap'>
                        {content}
                    </div>
                </div>
                <div style={{ display: expanded ? 'block' : 'none' }}>
                    {childrenList}
                    { addNew ?
                        <AddNewItem
                            key={'add-new-' + this.childAttributeType}
                            text={'New ' + this.childAttributeType}
                            id={'add-btn-' + instanceId}
                            parentInstanceId={instanceId}
                            selected={selected}
                            onClick={() => this.onAddAttribute(item)}
                            bars={this.bars + 1} /> :
                        null
                    }
                </div>
            </div>
        );
    }
}