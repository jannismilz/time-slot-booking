const tours = [
    {
        title: "Tour 1",
        startTime: "2024-10-08T21:00Z",
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
        startTime: "2024-10-08T21:15Z",
        endTime: "2024-10-08T22:00Z",
        visits: [],
    },
];

const blockSlots = 6;
let finalStartTime;
let finalEndTime;

/**
 * Slot block initialization
 */
const slotBlock = document.getElementById("slot-block");
const slotBlockContainer = document.getElementById("slot-block-container");

/**
 * Slot block reset button
 */
const slotBlockResetButton = document.getElementById("slot-block-reset");
slotBlockResetButton.addEventListener("click", moveSlotBlockBackToContainer);

/**
 * Whole interface initialization
 */
const slotTable = document.getElementById("slot-table");
let slotTableBody = slotTable.querySelector("tbody");
if (!slotTable.querySelector("tbody")) {
    slotTable.innerHTML += "<tbody></tbody>";
}
slotTableBody = document.querySelector("#slot-table > tbody");

resetWholeInterface();
initSlotBlock();

/**
 *
 * Slot Block
 *
 */
function initSlotBlock() {
    const firstTdEl = slotTableBody.getElementsByTagName("td")[0];
    const tdElStyle = window.getComputedStyle(firstTdEl, null);

    const slotBlockStyle = window.getComputedStyle(slotBlock, null);

    const tdPaddingX =
        parseFloat(tdElStyle.getPropertyValue("padding-left")) +
        parseFloat(tdElStyle.getPropertyValue("padding-right"));
    const slotBlockPadding =
        parseFloat(slotBlockStyle.getPropertyValue("padding-left")) +
        parseFloat(slotBlockStyle.getPropertyValue("padding-right"));
    const tdBorderWidth = tdElStyle.getPropertyValue("border-width");
    const tdWidthInRem = firstTdEl.offsetWidth / 16;

    // Dynamically adjust width considering own styling
    slotBlock.style.width = `calc(${
        blockSlots * tdWidthInRem - (tdPaddingX + slotBlockPadding) / 16
    }rem - ${tdBorderWidth})`;
    slotBlock.setAttribute("draggable", "true");
    slotBlock.setAttribute("ondragstart", "onSlotBlockDragStart(event)");
    slotBlock.setAttribute("ondragend", "onSlotBlockDragEnd(event)");
    resetSlotBlockText();
}

function resetSlotBlockText() {
    slotBlock.innerText = `${blockSlots} ${
        blockSlots > 1 ? "Children" : "Child"
    }`;
}

function onSlotBlockDragStart(ev) {
    if (ev.target.parentElement.localName === "td") return;

    event.dataTransfer.setDragImage(slotBlock, 0, 0);
    ev.target.classList.add("hidden");
    moveSlotBlockBackToContainer();
    resetWholeInterface();
}

function onSlotBlockDragEnd(ev) {
    ev.target.classList.remove("hidden");
    ev.srcElement.classList.remove("hidden");
}

/**
 *
 * Table Tour
 *
 */
function generateTourRow(tourTitle, tourIndex, slotsAmount, ghost) {
    const tourRow = [];
    ghost = ghost ?? false;

    tourRow.push(`<th>${tourTitle}</th>`);
    for (let i = 1; i <= slotsAmount; i++) {
        tourRow.push(
            `<td
              ${!ghost && `ondrop="onTimeSlotDrop(event, ${i}, ${tourIndex})"`}
              ${
                  !ghost &&
                  `ondragover="onTimeSlotDragOver(event, ${i}, ${tourIndex})"`
              }
              ${!ghost && `ondragleave="onTimeSlotDragLeave(event)"`}
              ${
                  !ghost &&
                  `onclick="onTimeSlotClick(event, ${i}, ${tourIndex})"`
              }
          ></td>`
        );
    }

    return (
        `<tr ${
            ghost ? "style='visibility: collapse'" : `tourIndex="${tourIndex}"`
        }>` +
        tourRow.join("\n") +
        "</tr>"
    );
}

function blockBookedVisits(tourIndex) {
    const tour = tours[tourIndex];
    const tourStartDate = new Date(tour.startTime);
    const tourEndDate = new Date(tour.endTime);
    const tourVisits = tour.visits;
    const tourRow = slotTableBody.querySelector(`[tourIndex="${tourIndex}"]`);

    let slotIndexes = [];

    tourVisits.forEach((visit) => {
        const startDate = new Date(visit.startTime);
        const endDate = new Date(visit.endTime);

        // If start or end of visit is not in the tour, just return
        if (
            startDate < tourStartDate ||
            endDate < tourStartDate ||
            startDate > tourEndDate ||
            endDate > tourEndDate
        ) {
            console.error("Visit is out of tour time period!");

            return;
        }

        const minutesToTourStartDate = (startDate - tourStartDate) / 1000 / 60;
        const firstIndex = minutesToTourStartDate / 5;
        const visitMinutes = (endDate - startDate) / 1000 / 60;

        const tempIndexes = [];

        for (let i = 1; i <= visitMinutes / 5; i++) {
            tempIndexes.push(firstIndex + i);
        }

        slotIndexes.push(tempIndexes);
    });

    slotIndexes.forEach((visitIndexes) => {
        visitIndexes.forEach((visitSlotIndex, index) => {
            const childEl = tourRow.children[visitSlotIndex];
            if (index === 0) {
                childEl.setAttribute("colspan", `${visitIndexes.length}`);
            } else {
                childEl.style.display = "none";
            }
            childEl.setAttribute("blocked", "true");
        });
    });
}

function onTimeSlotDrop(ev, slotIndex, tourIndex) {
    ev.preventDefault();

    setSlotBlockTextToTimespan(slotIndex, tourIndex);
    ev.target.appendChild(slotBlock);
    slotBlock.removeAttribute("draggable");
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

function onTimeSlotClick(ev, slotIndex, tourIndex) {
    const allowedToDrop = onTimeSlotDragOver(ev, slotIndex, tourIndex);

    if (allowedToDrop) {
        onTimeSlotDrop(ev, slotIndex, tourIndex);
    }
}

function onTimeSlotDragOver(ev, slotIndex, tourIndex) {
    let currentSlot = slotTableBody.querySelector(`[tourIndex="${tourIndex}"]`)
        .children[slotIndex];
    // -1 to exclude current item
    let slotsLeft = blockSlots - 1;

    while (slotsLeft) {
        if (currentSlot.getAttribute("blocked") === "true") return false;
        if (!currentSlot.nextElementSibling) return false;
        if (currentSlot.nextElementSibling.getAttribute("blocked") === "true")
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

function resetWholeInterface() {
    slotTable.innerHTML = "<tbody></tbody>";
    slotTableBody = document.querySelector("#slot-table > tbody");

    tours.forEach((tour, tourIndex) => {
        const startDate = new Date(tour.startTime);
        const endDate = new Date(tour.endTime);
        const totalTimeInSeconds =
            (endDate.getTime() - startDate.getTime()) / 1000;

        const slotsAmount = Math.floor(totalTimeInSeconds / (5 * 60));

        slotTableBody.innerHTML += generateHeaderRow(startDate, slotsAmount);
        slotTableBody.innerHTML += generateTourRow(
            tour.title,
            tourIndex,
            slotsAmount
        );
        slotTableBody.innerHTML += generateTourRow(
            tour.title,
            tourIndex,
            slotsAmount,
            true
        );
        blockBookedVisits(tourIndex);
    });
}

function setSlotBlockTextToTimespan(slotIndex, tourIndex) {
    const tour = tours[tourIndex];
    const totalMinutes = slotIndex * 5 - 5;

    let startHours =
        new Date(tour.startTime).getHours() + Math.floor(totalMinutes / 60);
    let startMinutes =
        new Date(tour.startTime).getMinutes() + (totalMinutes % 60);

    let endMinutes = startMinutes + blockSlots * 5;
    let endHours = startHours + Math.floor(endMinutes / 60);

    slotBlock.innerText = `${formattedTimeString(
        startHours % 24,
        startMinutes % 60
    )} - ${formattedTimeString(endHours % 24, endMinutes % 60)}`;
}

function moveSlotBlockBackToContainer() {
    if (slotBlock.parentElement.localName !== "td") return;

    slotBlockContainer.appendChild(slotBlock);
    resetSlotBlockText();
    resetWholeInterface();
}

/**
 *
 * Table Header
 *
 */
function generateHeaderRow(startDate, slotsAmount) {
    let startHours = startDate.getHours();
    let startMinutes = startDate.getMinutes();

    const headerRow = ["<th></th>"];

    while (slotsAmount > 0) {
        if (slotsAmount > 6) {
            headerRow.push(
                `<th colspan="6">${formattedTimeString(
                    startHours,
                    startMinutes
                )}</th>`
            );

            startHours += startMinutes + 30 > 59 ? 1 : 0;
            startMinutes += 30;

            startHours = startHours % 24;
            startMinutes = startMinutes % 60;

            slotsAmount -= 6;
        } else {
            headerRow.push(
                `<th colspan="${slotsAmount}">${formattedTimeString(
                    startHours,
                    startMinutes
                )}</th>`
            );

            slotsAmount = 0;
        }
    }

    return "<tr class='sort-table-header'>" + headerRow.join("\n") + "</tr>";
}
