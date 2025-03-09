import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function BtmDisplay() {
    const { categoryId } = useParams();

    const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
    const [error, setError] = useState(null); // Add error state
    const [loading, setLoading] = useState(true); // Add loading state

    if (error) {
        return <div>{error}</div>; // Display error message
    }

    return (
        <div>
            { loading ? 
                <div aria-live="polite">Loading...</div> 
                :
                <>
                    {message ? (
                    <>
                        <div className='districtDetailsDiv'>
                        <h2 style={{ fontFamily: 'Ubuntu' }}>Yıllara Göre {message.districtname} Nüfusu</h2>
                        <table className="provincetable" aria-label="{message.districtname} ilçesi yıllara göre nüfus tablosu">
                            <thead>
                            <tr>
                                <th scope="col">YIL</th>
                                <th scope="col">NÜFUS</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007].map(year => (
                                <tr key={year}><td>{year}</td><td>{formatNumber(message[year])}</td></tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </>
                    ) : (
                    <p>No data available</p> // Handle case where message is null or empty
                    )}
                </>
            }
        </div>
    )
}

export default BtmDisplay