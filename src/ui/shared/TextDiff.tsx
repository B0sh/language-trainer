import React, { useEffect, useState } from "react";
import { diff_match_patch, Diff } from "diff-match-patch";
import SlIcon from "@shoelace-style/shoelace/dist/react/icon/index.js";
import "./TextDiff.css";

interface Props {
    before: string;
    after: string;
}

export const TextDiff: React.FC<Props> = React.memo(({ before, after }) => {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(before, after);
    dmp.diff_cleanupSemantic(diffs);

    return (
        <>
            <div className="incorrect-text">
                <SlIcon name="x-lg" className="text-incorrect-icon" />
                {diffs.map((diff, index) => {
                    if (diff[0] === -1) {
                        return (
                            <del key={index} className="diff-delete">
                                {diff[1]}
                            </del>
                        );
                    }
                    if (diff[0] === 0) {
                        return <span key={index}>{diff[1]}</span>;
                    }
                })}
            </div>
            <div className="correct-text">
                <SlIcon name="check-lg" className="text-correct-icon" />
                {diffs.map((diff, index) => {
                    if (diff[0] === 1) {
                        return (
                            <ins key={index} className="diff-insert">
                                {diff[1]}
                            </ins>
                        );
                    }
                    if (diff[0] === 0) {
                        return <span key={index}>{diff[1]}</span>;
                    }
                })}
            </div>
        </>
    );
});
