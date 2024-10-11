const tours = [
    {
        title: "Tour 1",
        startTime: "2024-10-08T21:15Z",
        endTime: "2024-10-08T23:45Z",
        visits: [
            {
                startTime: "2024-10-08T21:15Z",
                endTime: "2024-10-08T21:30Z",
            },
            {
                startTime: "2024-10-08T21:45Z",
                endTime: "2024-10-08T22:45Z",
            },
        ],
    },
    {
        title: "Tour 2",
        startTime: "2024-10-08T20:15Z",
        endTime: "2024-10-08T23:00Z",
        visits: [],
    },
];

/**
 * Elements
 */
const finalStartTime = document.getElementById("tsb-result-startTime");
const finalEndTime = document.getElementById("tsb-result-endTime");
const table = document.getElementById("tsb-table");
const blockContainer = document.getElementById("tsb-block-container");
const block = document.getElementById("tsb-block");
const resetButton = document.getElementById("tsb-reset");

/**
 * Values
 */
const originalBlockText = block.innerText;
const blockSlots = parseInt(block.getAttribute("tsb-slots"));
let { earliestStartTime, latestEndTime } = tours.reduce(
    (acc, tour) => ({
        earliestStartTime:
            new Date(tour.startTime) < new Date(acc.earliestStartTime)
                ? tour.startTime
                : acc.earliestStartTime,
        latestEndTime:
            new Date(tour.endTime) > new Date(acc.latestEndTime)
                ? tour.endTime
                : acc.latestEndTime,
    }),
    {
        earliestStartTime: tours[0].startTime,
        latestEndTime: tours[0].endTime,
    }
);
earliestStartTime = new Date(earliestStartTime);
latestEndTime = new Date(latestEndTime);

const totalSlotsAmount = parseInt(
    (latestEndTime - earliestStartTime) / 1000 / 60 / 15
);

let tableBody = table.querySelector("tbody");

resetButton.addEventListener("click", moveBlockBackToContainer);

/**
 * Start point
 */
generateTable();
initBlock();

/**
 *
 * Slot Block
 *
 */
function initBlock() {
    const tdElements = tableBody.querySelectorAll(
        "tr:not([tsb-tourindex]) > td"
    );
    const measuringTdEl = tdElements[tdElements.length / 2 - 1];
    const tdElStyle = window.getComputedStyle(measuringTdEl, null);

    const blockStyle = window.getComputedStyle(block, null);

    const tdPaddingX =
        parseFloat(tdElStyle.getPropertyValue("padding-left")) +
        parseFloat(tdElStyle.getPropertyValue("padding-right"));
    const blockPadding =
        parseFloat(blockStyle.getPropertyValue("padding-left")) +
        parseFloat(blockStyle.getPropertyValue("padding-right"));
    const tdBorderWidth =
        parseFloat(tdElStyle.getPropertyValue("border-left-width")) +
        parseFloat(tdElStyle.getPropertyValue("border-right-width"));
    const tdWidthInRem = measuringTdEl.offsetWidth / 16;

    // Dynamically adjust width considering own styling
    block.style.width = `calc(${
        blockSlots * tdWidthInRem - (tdPaddingX + blockPadding) / 16
    }rem - ${tdBorderWidth}px)`;

    block.setAttribute("draggable", "true");
    block.setAttribute("ondragstart", "onSlotBlockDragStart(event)");
    block.setAttribute("ondragend", "onSlotBlockDragEnd(event)");
    resetBlockText();
}

function resetBlockText() {
    block.innerText = originalBlockText;
}

function onSlotBlockDragStart(ev) {
    if (ev.target.parentElement.localName === "td") return;

    event.dataTransfer.setDragImage(block, 0, 0);
    ev.target.style.transition = "0.01ms";
    ev.target.style.transform = "translateX(-9999px)";
}

function onSlotBlockDragEnd(ev) {
    ev.target.style.transition = "";
    ev.target.style.transform = "";
}

/**
 *
 * Table Tour
 *
 */
function generateTourRow(tour, tourIndex, ghost) {
    const tourRow = [`<th>${tour.title}</th>`];
    ghost = ghost ?? false;
    const tourStartTimeMinutes = earliestStartTime.getMinutes();

    for (let i = 0; i < totalSlotsAmount; i++) {
        if (ghost) {
            tourRow.push("<td></td>");
        } else {
            tourRow.push(
                `<td
                    ondrop="onTimeSlotDrop(event)"
                    ondragover="onTimeSlotDragOver(event)"
                    ondragleave="onTimeSlotDragLeave(event)"
                    onclick="onTimeSlotClick(event)"
                    tsb-slotindex="${i}"
                    ${
                        (i + tourStartTimeMinutes / 15 + 1) % 4 === 0
                            ? "tsb-isfullhour"
                            : ""
                    }
                ></td>`
            );
        }
    }

    return `<tr ${
        ghost ? "style='visibility: collapse'" : `tsb-tourindex="${tourIndex}"`
    }>${tourRow.join("\n")}</tr>`;
}

function blockOutsideTourSlots(tourIndex) {
    const tour = tours[tourIndex];
    const tourStartTime = new Date(tour.startTime);
    const tourEndTime = new Date(tour.endTime);
    const tourRow = tableBody.querySelector(`[tsb-tourindex="${tourIndex}"]`);

    const slotsSinceEarliest =
        (tourStartTime - earliestStartTime) / 1000 / 60 / 15;
    const slotsUntilLatest = (latestEndTime - tourEndTime) / 1000 / 60 / 15;

    const blockConditionalEl = (slotIndex, isMainEl, colspan) => {
        const slotEl = tourRow.querySelector(`[tsb-slotindex="${slotIndex}"]`);

        if (isMainEl) {
            slotEl.setAttribute("colspan", `${colspan}`);
            slotEl.setAttribute("tsb-non-visit", "true");
        } else {
            slotEl.style.display = "none";
        }
    };

    [...Array(slotsSinceEarliest).keys()].forEach((slot) => {
        blockConditionalEl(slot, slot === 0, slotsSinceEarliest);
    });

    [...Array(slotsUntilLatest).keys()].forEach((slot) => {
        blockConditionalEl(
            totalSlotsAmount - slot - 1,
            // -1 because totalSlotsAmount starts at 1 instead of 0
            slot + 1 === slotsUntilLatest,
            slotsUntilLatest
        );
    });
}

function assignSlotIndexes(tourIndex) {
    const tour = tours[tourIndex];
    const tourRow = tableBody.querySelector(`[tsb-tourindex="${tourIndex}"]`);

    // Reset all existing slotindexes first
    Array.from(tourRow.querySelectorAll("td[tsb-slotindex]")).forEach((slot) =>
        slot.removeAttribute("tsb-slotindex")
    );

    const validTourSlots = Array.from(
        tourRow.querySelectorAll('td:not([tsb-non-visit="true"])')
    ).filter((slot) => slot.style.display !== "none");

    validTourSlots.forEach((slot, index) => {
        slot.setAttribute("tsb-slotindex", `${index}`);
    });
}

function blockBookedVisits(tourIndex) {
    const tour = tours[tourIndex];
    const tourStartTime = new Date(tour.startTime);
    const tourEndTime = new Date(tour.endTime);
    const tourVisits = tour.visits;
    const tourRow = tableBody.querySelector(`[tsb-tourindex="${tourIndex}"]`);

    let slotIndexes = [];

    tourVisits.forEach((visit) => {
        const visitStartTime = new Date(visit.startTime);
        const visitEndDate = new Date(visit.endTime);

        // If start or end of visit is not in the tour, just return
        if (
            visitStartTime < tourStartTime ||
            visitEndDate < tourStartTime ||
            visitStartTime > tourEndTime ||
            visitEndDate > tourEndTime
        ) {
            console.error("Visit is out of tour time period!");

            return;
        }

        const minutesToTourStartDate =
            (visitStartTime - tourStartTime) / 1000 / 60;
        const firstIndex = minutesToTourStartDate / 15;
        const visitMinutes = (visitEndDate - visitStartTime) / 1000 / 60;

        const tempIndexes = [];

        for (let i = 0; i < visitMinutes / 15; i++) {
            tempIndexes.push(firstIndex + i);
        }

        slotIndexes.push(tempIndexes);
    });

    slotIndexes.forEach((visitIndexes) => {
        visitIndexes.forEach((visitSlotIndex, index) => {
            const childEl = tourRow.querySelector(
                `[tsb-slotindex="${visitSlotIndex}"]`
            );
            if (index === 0) {
                childEl.setAttribute("colspan", `${visitIndexes.length}`);
                childEl.setAttribute("tsb-booked", "true");
            } else {
                childEl.style.display = "none";
            }
        });
    });
}

function onTimeSlotDrop(ev) {
    ev.preventDefault();
    const slotIndex = parseInt(ev.target.getAttribute("tsb-slotindex"));
    const tourIndex = parseInt(
        ev.target.parentElement.getAttribute("tsb-tourindex")
    );

    setBlockTextToTimespan(slotIndex, tourIndex);
    ev.target.appendChild(block);
    block.removeAttribute("draggable");
    ev.target.setAttribute("colspan", blockSlots);

    let currentSlot = ev.target;
    // -1 because the active slot is excluded
    let slotsLeft = blockSlots - 1;

    while (slotsLeft > 0) {
        currentSlot = currentSlot.nextElementSibling;
        if (currentSlot) currentSlot.style.display = "none";
        slotsLeft--;
    }
}

function onTimeSlotDragLeave(ev) {
    ev.preventDefault();
}

function onTimeSlotClick(ev) {
    const slotIndex = parseInt(ev.target.getAttribute("tsb-slotindex"));
    const tourIndex = parseInt(
        ev.target.parentElement.getAttribute("tsb-tourindex")
    );
    const allowedToDrop = onTimeSlotDragOver(ev, slotIndex, tourIndex);
    const isInTable = block.parentElement.localName === "td";

    if (allowedToDrop && !isInTable) {
        onTimeSlotDrop(ev, slotIndex, tourIndex);
    }
}

function onTimeSlotDragOver(ev) {
    const tourRow = ev.target.parentElement;
    let currentSlot = ev.target;
    // -1 to exclude current item
    let slotsLeft = blockSlots - 1;

    while (slotsLeft) {
        if (currentSlot.getAttribute("tsb-booked") === "true") return false;
        if (currentSlot.getAttribute("tsb-non-visit") === "true") return false;
        if (!currentSlot.nextElementSibling) return false;
        if (
            currentSlot.nextElementSibling.getAttribute("tsb-booked") === "true"
        )
            return false;
        if (
            currentSlot.nextElementSibling.getAttribute("tsb-non-visit") ===
            "true"
        )
            return false;
        currentSlot = currentSlot.nextElementSibling;
        slotsLeft--;
    }

    ev.preventDefault();
    return true;
}

/**
 *
 * Helpers
 *
 */
function formattedTimeString(hours, minutes) {
    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
}

function generateTable() {
    table.innerHTML = "<tbody></tbody>";
    tableBody = table.querySelector("tbody");

    tableBody.innerHTML += generateHeaderRow();

    tours.forEach((tour, tourIndex) => {
        const startDate = new Date(tour.startTime);
        const endDate = new Date(tour.endTime);
        const totalTimeInSeconds =
            (endDate.getTime() - startDate.getTime()) / 1000;

        tableBody.innerHTML += generateTourRow(tour, tourIndex);
        blockOutsideTourSlots(tourIndex);
        assignSlotIndexes(tourIndex);
        blockBookedVisits(tourIndex);
    });
    tableBody.innerHTML += generateTourRow(tours[0], 0, true);
}

function setBlockTextToTimespan(slotIndex, tourIndex) {
    const tour = tours[tourIndex];
    const totalMinutes = slotIndex * 15 - 15;

    const tourStartTime = new Date(tour.startTime);
    const tourEndTime = new Date(tour.endTime);

    let startHours = tourStartTime.getHours() + Math.floor(totalMinutes / 60);
    let startMinutes = tourEndTime.getMinutes() + (totalMinutes % 60);

    let endMinutes = startMinutes + blockSlots * 5;
    let endHours = startHours + Math.floor(endMinutes / 60);

    const hoursAndMinutesToUTCString = (date, hours, minutes) => {
        let finalDate = new Date(date);
        finalDate = new Date(finalDate.setHours(hours, minutes, 0, 0));
        return finalDate.toISOString();
    };

    finalStartTime.value = hoursAndMinutesToUTCString(
        tourStartTime,
        startHours,
        startMinutes
    );
    finalEndTime.value = hoursAndMinutesToUTCString(
        tourEndTime,
        endHours,
        endMinutes
    );

    block.innerText = `${formattedTimeString(
        startHours % 24,
        startMinutes % 60
    )} - ${formattedTimeString(endHours % 24, endMinutes % 60)}`;
}

function moveBlockBackToContainer() {
    if (block.parentElement.localName !== "td") return;

    block.setAttribute("draggable", "true");
    blockContainer.appendChild(block);

    // Reset value fields
    finalStartTime.removeAttribute("value");
    finalEndTime.removeAttribute("value");

    resetBlockText();
    generateTable();
}

/**
 *
 * Table Header
 *
 */
function generateHeaderRow() {
    let startHours = earliestStartTime.getHours();
    const tourStartTimeMinutes = earliestStartTime.getMinutes();
    let startMinutes = tourStartTimeMinutes;

    const headerRow = ["<th></th>"];

    let slotsAmountLeft = totalSlotsAmount;

    if (tourStartTimeMinutes / 15 !== 0) {
        const slotsToFullHalfHour = 2 - tourStartTimeMinutes / 15;
        const minutesToFullHour = slotsToFullHalfHour * 15;
        headerRow.push(
            `<th colspan="${slotsToFullHalfHour}">${formattedTimeString(
                startHours,
                startMinutes
            )}</th>`
        );

        slotsAmountLeft -= slotsToFullHalfHour;
        startHours += startMinutes + minutesToFullHour > 59 ? 1 : 0;
        startMinutes += minutesToFullHour;

        startHours = startHours % 24;
        startMinutes = startMinutes % 60;
    }

    while (slotsAmountLeft > 0) {
        if (slotsAmountLeft > 2) {
            headerRow.push(
                `<th colspan="2">${formattedTimeString(
                    startHours,
                    startMinutes
                )}</th>`
            );

            startHours += startMinutes + 30 > 59 ? 1 : 0;
            startMinutes += 30;

            startHours = startHours % 24;
            startMinutes = startMinutes % 60;

            slotsAmountLeft -= 2;
        } else {
            headerRow.push(
                `<th colspan="${slotsAmountLeft}">${formattedTimeString(
                    startHours,
                    startMinutes
                )}</th>`
            );

            slotsAmountLeft = 0;
        }
    }

    return "<tr class='sort-table-header'>" + headerRow.join("\n") + "</tr>";
}
