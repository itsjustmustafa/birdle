import styles from "./conservation_status_map.module.css";

import AusMap from "../assets/aus_map.png";
import clsx from "clsx";


export type ConservationStatus =
    | "Not present"
    | "Introduced"
    | "Secure"
    | "Rare"
    | "Near threatened"
    | "Vulnerable"
    | "Endangered"
    | "Critically endangered"
    | "Status unspecified";


export type StateStatuses = {
    Federal: ConservationStatus;
    NSW: ConservationStatus;
    QLD: ConservationStatus;
    VIC: ConservationStatus;
    SA: ConservationStatus;
    NT: ConservationStatus;
    WA: ConservationStatus;
    TAS: ConservationStatus;
}


const STATUS_EMOJI_MAP: Record<ConservationStatus, string> = {
    "Not present": "🚫",
    "Introduced": "🌱",
    "Secure": "🛡️",
    "Rare": "💎",
    "Near threatened": "⚠️",
    "Vulnerable": "🩹",
    "Endangered": "🚨",
    "Critically endangered": "💥",
    "Status unspecified": "❓",
} as const;

export const getStatusEmoji = (status: string): string => {
    if (status in STATUS_EMOJI_MAP) {
        return STATUS_EMOJI_MAP[status as ConservationStatus];
    }

    return "❓";
};

export type ConservationStatusMapProps = {
    statuses: StateStatuses;
    targetStatuses: StateStatuses;
}

export function ConservationStatusMap({ statuses, targetStatuses }: ConservationStatusMapProps) {

    const results = {
        Federal: statuses.Federal == targetStatuses.Federal,
        NSW: statuses.NSW == targetStatuses.NSW,
        VIC: statuses.VIC == targetStatuses.VIC,
        QLD: statuses.QLD == targetStatuses.QLD,
        TAS: statuses.TAS == targetStatuses.TAS,
        SA: statuses.SA == targetStatuses.SA,
        NT: statuses.NT == targetStatuses.NT,
        WA: statuses.WA == targetStatuses.WA,
    }

    return (
        <div className={styles.mapContainer}>
            <img src={AusMap} className={styles.borders} />
            <img src={AusMap} className={styles.backdrop} />
            <div className={clsx(
                styles.nsw,
                results.NSW && styles.green,
                !results.NSW && styles.red,
            )} />
            <div className={clsx(
                styles.vic,
                results.VIC && styles.green,
                !results.VIC && styles.red,
            )} />
            <div className={clsx(
                styles.qld,
                results.QLD && styles.green,
                !results.QLD && styles.red,
            )} />
            <div className={clsx(
                styles.tas,
                results.TAS && styles.green,
                !results.TAS && styles.red,
            )} />
            <div className={clsx(
                styles.sa,
                results.SA && styles.green,
                !results.SA && styles.red,
            )} />
            <div className={clsx(
                styles.nt,
                results.NT && styles.green,
                !results.NT && styles.red,
            )} />
            <div className={clsx(
                styles.wa,
                results.WA && styles.green,
                !results.WA && styles.red,
            )} />
            <p className={styles.nswLabel} data-tooltip={"NSW: " + statuses.NSW}>{getStatusEmoji(statuses.NSW)}</p>
            <p className={styles.qldLabel} data-tooltip={"QLD: " + statuses.QLD}>{getStatusEmoji(statuses.QLD)}</p>
            <p className={styles.vicLabel} data-tooltip={"VIC: " + statuses.VIC}>{getStatusEmoji(statuses.VIC)}</p>
            <p className={styles.tasLabel} data-tooltip={"TAS: " + statuses.TAS}>{getStatusEmoji(statuses.TAS)}</p>
            <p className={styles.saLabel} data-tooltip={"SA: " + statuses.SA}>{getStatusEmoji(statuses.SA)}</p>
            <p className={styles.ntLabel} data-tooltip={"NT: " + statuses.NT}>{getStatusEmoji(statuses.NT)}</p>
            <p className={styles.waLabel} data-tooltip={"WA: " + statuses.WA}>{getStatusEmoji(statuses.WA)}</p>

        </div>
    );
}