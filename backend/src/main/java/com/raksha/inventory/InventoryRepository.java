package com.raksha.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InventoryRepository extends JpaRepository<InventoryItem, String>,
        JpaSpecificationExecutor<InventoryItem> {
}
