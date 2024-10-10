const tours = [
    {
        title: "Tour 1",
        startTime: "2024-10-08T21:15Z",
        endTime: "2024-10-08T23:00Z",
        visits: [
            {
                startTime: "2024-10-08T21:15Z",
                endTime: "2024-10-08T21:30Z",
            },
            {
                startTime: "2024-10-08T21:45Z",
                endTime: "2024-10-08T22:15Z",
            },
        ],
    },
    {
        title: "Tour 2",
        startTime: "2024-10-08T20:15Z",
        endTime: "2024-10-08T23:45Z",
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
if (!tableBody) {
    table.innerHTML = "<tbody></tbody>";
    tableBody = table.querySelector("tbody");
}

/**
 * Start point
 */
generateTable();

/**
 *
 * Slot Block
 *
 */
// function initSlotBlock() {
//     const firstTdEl = slotTableBody.getElementsByTagName("td")[0];
//     const tdElStyle = window.getComputedStyle(firstTdEl, null);

//     const slotBlockStyle = window.getComputedStyle(slotBlock, null);

//     const tdPaddingX =
//         parseFloat(tdElStyle.getPropertyValue("padding-left")) +
//         parseFloat(tdElStyle.getPropertyValue("padding-right"));
//     const slotBlockPadding =
//         parseFloat(slotBlockStyle.getPropertyValue("padding-left")) +
//         parseFloat(slotBlockStyle.getPropertyValue("padding-right"));
//     const tdBorderWidth = tdElStyle.getPropertyValue("border-width");
//     const tdWidthInRem = firstTdEl.offsetWidth / 16;

//     // Dynamically adjust width considering own styling
//     slotBlock.style.width = `calc(${
//         blockSlots * tdWidthInRem - (tdPaddingX + slotBlockPadding) / 16
//     }rem - ${tdBorderWidth})`;
//     slotBlock.setAttribute("draggable", "true");
//     slotBlock.setAttribute("ondragstart", "onSlotBlockDragStart(event)");
//     slotBlock.setAttribute("ondragend", "onSlotBlockDragEnd(event)");
//     resetSlotBlockText();
// }

function resetSlotBlockText() {
    slotBlock.innerText = originalBlockText;
}

// function onSlotBlockDragStart(ev) {
//     if (ev.target.parentElement.localName === "td") return;

//     event.dataTransfer.setDragImage(slotBlock, 0, 0);
//     ev.target.classList.add("hidden");
//     moveSlotBlockBackToContainer();
//     generateTable();
// }

// function onSlotBlockDragEnd(ev) {
//     ev.target.classList.remove("hidden");
//     ev.srcElement.classList.remove("hidden");
// }

/**
 *
 * Table Tour
 *
 */
function generateTourRow(tour, tourIndex, ghost) {
    const tourRow = [`<th>${tour.title}</th>`];
    ghost = ghost ?? false;
    const tourStartTimeMinutes = earliestStartTime.getMinutes();

    for (let i = 1; i <= totalSlotsAmount; i++) {
        if (ghost) {
            tourRow.push("<td></td>");
        } else {
            tourRow.push(
                `<td
                    ondrop="onTimeSlotDrop(event)"
                    ondragover="onTimeSlotDragOver(event)"
                    ondragleave="onTimeSlotDragLeave(event)"
                    onclick="onTimeSlotClick(event)"
                    slotindex="${i}"
                    ${
                        (i + tourStartTimeMinutes / 15) % 4 === 0
                            ? "isfullhour"
                            : ""
                    }
                ></td>`
            );
        }
    }

    return `<tr ${
        ghost ? "style='visibility: collapse'" : `tourindex="${tourIndex}"`
    }>${tourRow.join("\n")}</tr>`;
}

// function blockBookedVisits(tourIndex) {
//     const tour = tours[tourIndex];
//     const tourStartDate = new Date(tour.startTime);
//     const tourEndDate = new Date(tour.endTime);
//     const tourVisits = tour.visits;
//     const tourRow = slotTableBody.querySelector(`[tourIndex="${tourIndex}"]`);

//     let slotIndexes = [];

//     tourVisits.forEach((visit) => {
//         const startDate = new Date(visit.startTime);
//         const endDate = new Date(visit.endTime);

//         // If start or end of visit is not in the tour, just return
//         if (
//             startDate < tourStartDate ||
//             endDate < tourStartDate ||
//             startDate > tourEndDate ||
//             endDate > tourEndDate
//         ) {
//             console.error("Visit is out of tour time period!");

//             return;
//         }

//         const minutesToTourStartDate = (startDate - tourStartDate) / 1000 / 60;
//         const firstIndex = minutesToTourStartDate / 5;
//         const visitMinutes = (endDate - startDate) / 1000 / 60;

//         const tempIndexes = [];

//         for (let i = 1; i <= visitMinutes / 5; i++) {
//             tempIndexes.push(firstIndex + i);
//         }

//         slotIndexes.push(tempIndexes);
//     });

//     slotIndexes.forEach((visitIndexes) => {
//         visitIndexes.forEach((visitSlotIndex, index) => {
//             const childEl = tourRow.children[visitSlotIndex];
//             if (index === 0) {
//                 childEl.setAttribute("colspan", `${visitIndexes.length}`);
//             } else {
//                 childEl.style.display = "none";
//             }
//             childEl.setAttribute("blocked", "true");
//         });
//     });
// }

// function onTimeSlotDrop(ev, slotIndex, tourIndex) {
//     ev.preventDefault();

//     setSlotBlockTextToTimespan(slotIndex, tourIndex);
//     ev.target.appendChild(slotBlock);
//     slotBlock.removeAttribute("draggable");
//     ev.target.setAttribute("colspan", blockSlots);

//     let currentSlot = ev.target;
//     // -1 because the active slot is excluded
//     let slotsLeft = blockSlots - 1;

//     while (slotsLeft > 0) {
//         currentSlot = currentSlot.nextElementSibling;
//         if (currentSlot) currentSlot.style.display = "none";
//         slotsLeft--;
//     }
// }

// function onTimeSlotDragLeave(ev) {
//     ev.preventDefault();
// }

// function onTimeSlotClick(ev, slotIndex, tourIndex) {
//     const allowedToDrop = onTimeSlotDragOver(ev, slotIndex, tourIndex);
//     const isInTable = slotBlock.parentElement.localName === "td";

//     if (allowedToDrop && !isInTable) {
//         onTimeSlotDrop(ev, slotIndex, tourIndex);
//     }
// }

// function onTimeSlotDragOver(ev, slotIndex, tourIndex) {
//     let currentSlot = slotTableBody.querySelector(`[tourIndex="${tourIndex}"]`)
//         .children[slotIndex];
//     // -1 to exclude current item
//     let slotsLeft = blockSlots - 1;

//     while (slotsLeft) {
//         if (currentSlot.getAttribute("blocked") === "true") return false;
//         if (!currentSlot.nextElementSibling) return false;
//         if (currentSlot.nextElementSibling.getAttribute("blocked") === "true")
//             return false;
//         currentSlot = currentSlot.nextElementSibling;
//         slotsLeft--;
//     }

//     ev.preventDefault();
//     return true;
// }

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
        // tableBody.innerHTML += generateTourRow(tour, tourIndex, true);
        // blockBookedVisits(tourIndex);
    });
}

// function setSlotBlockTextToTimespan(slotIndex, tourIndex) {
//     const tour = tours[tourIndex];
//     const totalMinutes = slotIndex * 5 - 5;

//     const tourStartTime = new Date(tour.startTime);
//     const tourEndTime = new Date(tour.endTime);

//     let startHours = tourStartTime.getHours() + Math.floor(totalMinutes / 60);
//     let startMinutes = tourEndTime.getMinutes() + (totalMinutes % 60);

//     let endMinutes = startMinutes + blockSlots * 5;
//     let endHours = startHours + Math.floor(endMinutes / 60);

//     const hoursAndMinutesToUTCString = (date, hours, minutes) => {
//         let finalDate = new Date(date);
//         finalDate = new Date(finalDate.setHours(hours, minutes, 0, 0));
//         return finalDate.toISOString();
//     };

//     startTimeInput.value = hoursAndMinutesToUTCString(
//         tourStartTime,
//         startHours,
//         startMinutes
//     );
//     endTimeInput.value = hoursAndMinutesToUTCString(
//         tourEndTime,
//         endHours,
//         endMinutes
//     );

//     slotBlock.innerText = `${formattedTimeString(
//         startHours % 24,
//         startMinutes % 60
//     )} - ${formattedTimeString(endHours % 24, endMinutes % 60)}`;
// }

// function moveSlotBlockBackToContainer() {
//     if (slotBlock.parentElement.localName !== "td") return;

//     slotBlock.setAttribute("draggable", "true");
//     slotBlockContainer.appendChild(slotBlock);

//     // Reset value fields
//     startTimeInput.removeAttribute("value");
//     endTimeInput.removeAttribute("value");

//     resetSlotBlockText();
//     generateTable();
// }

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
        startHours += startMinutes + minutesToFullHour > 29 ? 1 : 0;
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

            startHours = startHours % 24;

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
