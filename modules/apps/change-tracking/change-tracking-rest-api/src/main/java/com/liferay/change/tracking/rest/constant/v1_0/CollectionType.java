/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.change.tracking.rest.constant.v1_0;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Objects;

import javax.annotation.Generated;

/**
 * @author Mate Thurzo
 * @generated
 */
@Generated("")
public enum CollectionType {

	ACTIVE("active"), ALL("all"), PRODUCTION("production"), RECENT("recent");

	@JsonCreator
	public static CollectionType fromString(String value) {
		for (CollectionType collectionType : values()) {
			if (Objects.equals(collectionType.getValue(), value)) {
				return collectionType;
			}
		}

		return null;
	}

	@JsonValue
	public String getValue() {
		return _value;
	}

	@Override
	public String toString() {
		return _value;
	}

	private CollectionType(String value) {
		_value = value;
	}

	private final String _value;

}