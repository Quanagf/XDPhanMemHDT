package com.evrental.booking.repository;

import com.evrental.booking.model.BookingContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingContractRepository extends JpaRepository<BookingContract, Long> {
}
