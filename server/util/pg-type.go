package util

import (
	"encoding/hex"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

func PgUuidToString(myUUID pgtype.UUID) string {
	return fmt.Sprintf("%x-%x-%x-%x-%x", myUUID.Bytes[0:4], myUUID.Bytes[4:6], myUUID.Bytes[6:8], myUUID.Bytes[8:10], myUUID.Bytes[10:16])
}

func StringToPgUuid(uuidString string) (pgtype.UUID, error) {
	uuidBytes, err := parseUUID(uuidString)
	if err != nil {
		return pgtype.UUID{}, err
	}
	return pgtype.UUID{
		Bytes: uuidBytes,
		Valid: true,
	}, nil
}

// Copied from https://github.com/jackc/pgtype/blob/master/uuid.go.
// parseUUID converts a string UUID in standard form to a byte array.
func parseUUID(src string) ([16]byte, error) {
	var uuidBuf [32]byte
	var dst [16]byte

	srcBuf := uuidBuf[:]

	switch len(src) {
	case 36:
		copy(srcBuf[0:8], src[:8])
		copy(srcBuf[8:12], src[9:13])
		copy(srcBuf[12:16], src[14:18])
		copy(srcBuf[16:20], src[19:23])
		copy(srcBuf[20:], src[24:])
	case 32:
		// dashes already stripped, assume valid
		copy(srcBuf, src)

	default:
		// assume invalid.
		return dst, fmt.Errorf("cannot parse UUID %v", src)
	}

	_, err := hex.Decode(dst[:], srcBuf)
	if err != nil {
		return dst, err
	}
	return dst, err
}
