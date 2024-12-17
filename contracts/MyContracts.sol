// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    struct Deal {
        string farmerId;            // MongoDB-generated unique ID for the farmer
        string buyerId;             // MongoDB-generated unique ID for the buyer
        string cropName;            // Name of the crop
        uint256 price;              // Price agreed for the deal
        uint256 quantity;           // Amount of crop in the contract
        string startDate;           // Start date of the deal
        string endDate;             // End date of the deal
        string status;              // Tracks the deal's status
        string advancedTransactionId; // Transaction ID for advance payment
        string paymentTransactionId;  // Transaction ID for final payment (set later)
    }

    mapping(uint256 => Deal) public deals; // Mapping to store deals by unique ID
    uint256 public dealCount;             // Counter for deal IDs

    event DealCreated(
        uint256 dealId,
        string farmerId,
        string buyerId,
        string cropName,
        uint256 price,
        uint256 quantity,
        string startDate,
        string endDate,
        string status,
        string advancedTransactionId
    );

    event DealUpdated(uint256 dealId, string status, string paymentTransactionId);

    // Create a new deal
    function createDeal(
        string memory farmerId,
        string memory buyerId,
        string memory cropName,
        uint256 price,
        uint256 quantity,
        string memory startDate,
        string memory endDate,
        string memory advancedTransactionId
    ) public {
        dealCount++;
        deals[dealCount] = Deal({
            farmerId: farmerId,
            buyerId: buyerId,
            cropName: cropName,
            price: price,
            quantity: quantity,
            startDate: startDate,
            endDate: endDate,
            status: "start",
            advancedTransactionId: advancedTransactionId,
            paymentTransactionId: "" // Initialize as empty
        });

        emit DealCreated(
            dealCount,
            farmerId,
            buyerId,
            cropName,
            price,
            quantity,
            startDate,
            endDate,
            "start",
            advancedTransactionId
        );
    }

    // Update deal with final payment transaction ID and mark as done
    function markAsCompleted(uint256 dealId, string memory paymentTransactionId) public {
        Deal storage deal = deals[dealId];
        require(
            keccak256(abi.encodePacked(deal.status)) == keccak256(abi.encodePacked("end")),
            "The deal cannot be completed at this stage."
        );

        deal.status = "complete";
        deal.paymentTransactionId = paymentTransactionId;

        emit DealUpdated(dealId, deal.status, paymentTransactionId);
    }

    // Cancel a deal by the buyer
    function cancelByBuyer(uint256 dealId, string memory buyerId) public {
        Deal storage deal = deals[dealId];
        require(
            keccak256(abi.encodePacked(deal.buyerId)) == keccak256(abi.encodePacked(buyerId)),
            "Only the assigned buyer can cancel this deal."
        );
        require(
            keccak256(abi.encodePacked(deal.status)) == keccak256(abi.encodePacked("start")),
            "The deal cannot be canceled at this stage."
        );

        deal.status = "Cancelled by Buyer";
        emit DealUpdated(dealId, deal.status, "");
    }

    // Cancel a deal by the farmer
    function cancelByFarmer(uint256 dealId, string memory farmerId) public {
        Deal storage deal = deals[dealId];
        require(
            keccak256(abi.encodePacked(deal.farmerId)) == keccak256(abi.encodePacked(farmerId)),
            "Only the assigned farmer can cancel this deal."
        );
        require(
            keccak256(abi.encodePacked(deal.status)) == keccak256(abi.encodePacked("start")),
            "The deal cannot be canceled at this stage."
        );

        deal.status = "Cancelled by Farmer";
        emit DealUpdated(dealId, deal.status, "");
    }

    // Mark the deal as "end"
    function markAsEnded(uint256 dealId) public {
        Deal storage deal = deals[dealId];
        require(
            keccak256(abi.encodePacked(deal.status)) == keccak256(abi.encodePacked("start")),
            "The deal cannot be ended at this stage."
        );

        deal.status = "end";
        emit DealUpdated(dealId, deal.status, "");
    }

    // Check if the due date has passed
    function checkDueDate(uint256 dealId, string memory currentDate) public {
        Deal storage deal = deals[dealId];
        require(
            keccak256(abi.encodePacked(deal.status)) == keccak256(abi.encodePacked("start")),
            "The deal is not active."
        );

        if (
            keccak256(abi.encodePacked(currentDate)) >
            keccak256(abi.encodePacked(deal.endDate))
        ) {
            deal.status = "Due Date Passed";
            emit DealUpdated(dealId, deal.status, "");
        }
    }
    function getDeal(uint256 dealId) public view returns (
        string memory farmerId,
        string memory buyerId,
        string memory cropName,
        uint256 price,
        uint256 quantity,
        string memory startDate,
        string memory endDate,
        string memory status,
        string memory advancedTransactionId,
        string memory paymentTransactionId
    ) {
        require(bytes(deals[dealId].farmerId).length > 0, "Deal does not exist.");

        Deal memory deal = deals[dealId];
        return (
            deal.farmerId,
            deal.buyerId,
            deal.cropName,
            deal.price,
            deal.quantity,
            deal.startDate,
            deal.endDate,
            deal.status,
            deal.advancedTransactionId,
            deal.paymentTransactionId
        );
    }
}
